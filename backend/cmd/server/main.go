package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"backend/internal/auth"
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/health"
	"backend/internal/history"
	"backend/internal/liked"
	"backend/internal/middleware"
	"backend/internal/playlists"
	"backend/internal/search"
	"backend/internal/stream"
	"backend/internal/videos"

	"github.com/jackc/pgx/v5/pgxpool"
)

func newHTTPHandler(db *pgxpool.Pool, environment string) http.Handler {
	// Wire up feature handlers
	healthH := health.NewHandler(db)

	streamSvc := stream.NewService(db)
	streamH := stream.NewHandler(streamSvc)

	videoRepository := videos.NewRepository(db)
	videoService := videos.NewService(videoRepository)

	searchSvc := search.NewService(videoService)
	searchH := search.NewHandler(searchSvc)

	playlistRepo := playlists.NewRepository(videoService)
	playlistH := playlists.NewHandler(playlistRepo)

	historyRepo := history.NewRepository(db, videoService)
	historyH := history.NewHandler(historyRepo)

	sessions := auth.NewSessionStore(db)
	authRepo := auth.NewRepository(sessions, db, environment == "production")
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
	mux.HandleFunc("GET /api/playlist-details", playlistH.HandleDetails)
	mux.HandleFunc("GET /api/popular-playlists", playlistH.HandlePopular)
	mux.HandleFunc("GET /api/playlist-tracks", playlistH.HandleTracks)
	mux.Handle("GET /api/stream/manifest", protected(streamH.HandleManifest))
	mux.HandleFunc("GET /api/search", searchH.Handle)
	mux.Handle("GET /api/playback-history", protected(historyH.Handle))

	mux.HandleFunc("POST /api/auth/register", authH.HandleRegister)
	mux.HandleFunc("POST /api/auth/login", authH.HandleLogin)

	mux.Handle("POST /api/auth/logout", protected(authH.HandleLogout))
	mux.Handle("GET  /api/auth/me", protected(authH.HandleMe))

	mux.Handle("GET /api/liked", protected(likedH.Handle))
	mux.Handle("POST /api/liked", protected(likedH.HandlePost))

	return middleware.CORSMiddleware(mux)
}

func main() {
	environment := os.Getenv("ENV")
	// Initialize modern structured logging (slog) using Text format for readability in development
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))
	slog.SetDefault(logger)

	// Load configuration from environment variables
	cfg := config.Load()

	// Initialize database
	db, err := database.InitDB(context.Background(), cfg.DatabaseURL)
	if err != nil {
		slog.Error("Failed to initialize database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	// Define our HTTP server with robust, production-ready timeouts
	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      newHTTPHandler(db, environment),
		ReadTimeout:  10 * time.Second,  // Max duration for reading the entire request (prevents slowloris)
		WriteTimeout: 10 * time.Second,  // Max duration before timing out writes of the response
		IdleTimeout:  120 * time.Second, // Max amount of time to keep keep-alive connections idle
	}

	// Channel to listen for HTTP server run failures
	shutdownError := make(chan error)

	go func() {
		slog.Info("Starting backend server", "port", cfg.Port, "url", "http://localhost:"+cfg.Port)

		// Start the server (ListenAndServe always returns an error, ErrServerClosed is normal)
		err := server.ListenAndServe()
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			shutdownError <- err
		}
	}()

	// Set up channel to capture OS system signals (SIGINT, SIGTERM) for graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-quit:
		slog.Info("Shutting down backend server gracefully...", "signal", sig.String())

		// Create a context with a timeout to give active connections time to finish
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()

		// Shutdown stops the server, rejecting new requests and waiting for active ones to complete
		if err := server.Shutdown(ctx); err != nil {
			slog.Error("Graceful shutdown failed", "error", err)
			os.Exit(1)
		}
		slog.Info("Server stopped successfully")

	case err := <-shutdownError:
		slog.Error("Server start-up error", "error", err)
		os.Exit(1)
	}
}
