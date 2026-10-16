package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"backend/internal/auth"
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/health"
	"backend/internal/liked"
	"backend/internal/logging"
	"backend/internal/middleware"
	"backend/internal/storage"
	"backend/internal/videos"

	"github.com/jackc/pgx/v5/pgxpool"
)

// newHTTPHandler wires the feature packages together. The returned processor must be started by the caller.
func newHTTPHandler(db *pgxpool.Pool, cfg config.Config) (http.Handler, *videos.Processor, error) {
	videoStore, err := storage.NewR2Storage(storage.R2Config{
		AccountID:       cfg.R2AccountID,
		AccessKeyID:     cfg.R2AccessKeyID,
		SecretAccessKey: cfg.R2SecretAccessKey,
		Bucket:          cfg.R2Bucket,
		Endpoint:        cfg.R2Endpoint,
	})
	if err != nil {
		return nil, nil, fmt.Errorf("initialize video storage: %w", err)
	}

	healthH := health.NewHandler(db)

	videoService := videos.NewService(videos.NewRepository(db), videoStore, videos.Settings{
		MaxUploadBytes: cfg.MaxUploadBytes,
		UploadURLTTL:   cfg.UploadURLTTL,
		PlaybackURLTTL: cfg.PlaybackURLTTL,
	})
	videoProcessor := videos.NewProcessor(videoService, videoStore)
	videoH := videos.NewHandler(videoService, videoProcessor)

	sessions := auth.NewSessionStore(db)
	authRepo := auth.NewRepository(sessions, db, cfg.Env == "production")
	authH := auth.NewHandler(authRepo)

	likedRepo := liked.NewRepository(db, videoService)
	likedH := liked.NewHandler(likedRepo)

	// Create a new ServeMux (Go 1.22+ supports HTTP methods in path patterns)
	mux := http.NewServeMux()

	// Auth + CSRF protected
	protected := func(h http.HandlerFunc) http.Handler {
		return sessions.Auth(sessions.CSRF(h))
	}

	// Register handlers
	mux.HandleFunc("GET /health", healthH.Handle)
	mux.HandleFunc("GET /api/health", healthH.Handle)

	mux.HandleFunc("POST /api/auth/register", authH.HandleRegister)
	mux.HandleFunc("POST /api/auth/login", authH.HandleLogin)

	mux.Handle("POST /api/auth/logout", protected(authH.HandleLogout))
	mux.Handle("GET  /api/auth/me", protected(authH.HandleMe))

	mux.Handle("POST /api/videos/uploads", protected(videoH.HandleInitUpload))
	mux.Handle("POST /api/videos/{id}/uploads/parts", protected(videoH.HandlePresignParts))
	mux.Handle("POST /api/videos/{id}/uploads/complete", protected(videoH.HandleCompleteUpload))
	mux.Handle("GET /api/videos", protected(videoH.HandleList))
	mux.Handle("GET /api/videos/{id}", protected(videoH.HandleGet))
	mux.Handle("PATCH /api/videos/{id}", protected(videoH.HandleUpdate))
	mux.Handle("DELETE /api/videos/{id}", protected(videoH.HandleDelete))
	mux.Handle("GET /api/videos/{id}/playback-url", protected(videoH.HandlePlaybackURL))
	mux.Handle("GET /api/videos/{id}/thumbnail", protected(videoH.HandleThumbnail))

	mux.Handle("GET /api/liked", protected(likedH.Handle))
	mux.Handle("POST /api/liked", protected(likedH.HandlePost))

	return logging.Middleware(middleware.CORSMiddleware(mux)), videoProcessor, nil
}

func main() {
	// Load configuration from environment variables
	cfg := config.Load()

	flushLogs, err := logging.Setup(cfg)
	if err != nil {
		slog.Error("Failed to initialize error reporting", "error", err)
	}
	defer flushLogs()

	// Initialize database
	db, err := database.InitDB(context.Background(), cfg.DatabaseURL)
	if err != nil {
		slog.Error("Failed to initialize database", "error", err)
		flushLogs()
		os.Exit(1)
	}
	defer db.Close()

	appContext, stopApp := context.WithCancel(context.Background())
	defer stopApp()

	handler, videoProcessor, err := newHTTPHandler(db, cfg)
	if err != nil {
		slog.Error("Failed to build HTTP handler", "error", err)
		flushLogs()
		os.Exit(1)
	}
	videoProcessor.Start(appContext)

	// Define our HTTP server with robust, production-ready timeouts
	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      handler,
		ReadTimeout:  config.ServerReadTimeout,  // Max duration for reading the entire request (prevents slowloris)
		WriteTimeout: config.ServerWriteTimeout, // Max duration before timing out writes of the response
		IdleTimeout:  config.ServerIdleTimeout,  // Max amount of time to keep keep-alive connections idle
	}

	// Channel to listen for HTTP server run failures
	shutdownError := make(chan error)

	go func() {
		slog.Info("Starting backend server", "port", cfg.Port, "url", "http://localhost:"+cfg.Port)

		// Start the server (ListenAndServe always returns an error, ErrServerClosed is normal)
		err := server.ListenAndServe()
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			shutdownError <- err
			stopApp()
		}
	}()

	// Set up channel to capture OS system signals (SIGINT, SIGTERM) for graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-quit:
		slog.Info("Shutting down backend server gracefully...", "signal", sig.String())

		// Create a context with a timeout to give active connections time to finish
		ctx, cancel := context.WithTimeout(context.Background(), config.ServerShutdownTimeout)
		defer cancel()

		// Shutdown stops the server, rejecting new requests and waiting for active ones to complete
		if err := server.Shutdown(ctx); err != nil {
			slog.Error("Graceful shutdown failed", "error", err)
			os.Exit(1)
		}
		slog.Info("Server stopped successfully")

	case err := <-shutdownError:
		slog.Error("Server start-up error", "error", err)
		flushLogs()
		os.Exit(1)
	}
}
