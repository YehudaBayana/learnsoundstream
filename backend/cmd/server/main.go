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

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/health"
	"backend/internal/history"
	"backend/internal/middleware"
	"backend/internal/playlists"
	"backend/internal/search"
	"backend/internal/stream"
)

func main() {
	// Initialize modern structured logging (slog) using Text format for readability in development
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))
	slog.SetDefault(logger)

	// Load configuration from environment variables
	cfg := config.Load()

	// Initialize database
	db, err := database.InitDB(cfg.DatabaseURL)
	if err != nil {
		slog.Error("Failed to initialize database", "error", err)
		os.Exit(1)
	}
		defer db.Close()
	

	// Wire up feature handlers
	healthH := health.NewHandler(db)

	searchSvc := search.NewService()
	searchH := search.NewHandler(searchSvc)

	streamSvc := stream.NewService(db)
	streamH := stream.NewHandler(streamSvc)

	playlistRepo := playlists.NewRepository()
	playlistH := playlists.NewHandler(playlistRepo)

	historyRepo := history.NewRepository(db)
	historyH := history.NewHandler(historyRepo)

	// Create a new ServeMux (Go 1.22+ supports HTTP methods in path patterns)
	mux := http.NewServeMux()

	// Register handlers
	mux.HandleFunc("GET /health", healthH.Handle)
	mux.HandleFunc("GET /api/health", healthH.Handle)
	mux.HandleFunc("GET /api/playlist-details", playlistH.HandleDetails)
	mux.HandleFunc("GET /api/popular-playlists", playlistH.HandlePopular)
	mux.HandleFunc("GET /api/playlist-tracks", playlistH.HandleTracks)
	mux.HandleFunc("GET /api/stream", streamH.Handle)
	mux.HandleFunc("GET /api/search", searchH.Handle)
	mux.HandleFunc("GET /api/playback-history", historyH.Handle)

	// Wrap mux with CORS middleware from internal/middleware
	handler := middleware.CORSMiddleware(mux)

	// Define our HTTP server with robust, production-ready timeouts
	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      handler,
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
