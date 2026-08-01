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

	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/middleware"
)

func main() {
	// Initialize modern structured logging (slog) using Text format for readability in development
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))
	slog.SetDefault(logger)

	// Get port from environment variable, fallback to standard 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Get DB connection string (use default for local development via Docker)
	dbConnStr := os.Getenv("DATABASE_URL")
	if dbConnStr == "" {
		dbConnStr = "postgres://soundstream:password123@localhost:5432/soundstream?sslmode=disable"
	}

	// Initialize database
	db, err := database.InitDB(dbConnStr)
	if err != nil {
		slog.Error("Failed to initialize database", "error", err)
		// We could exit here, but let's allow the app to start without DB for resilience
	}
	if db != nil {
		defer db.Close()
	}

	// Create App instance with dependencies
	app := handlers.NewApp(db)

	// Create a new ServeMux (Go 1.22+ supports HTTP methods in path patterns)
	mux := http.NewServeMux()

	// Register handlers from internal/handlers
	mux.HandleFunc("GET /health", app.HealthHandler)
	mux.HandleFunc("GET /api/health", app.HealthHandler)
	mux.HandleFunc("GET /api/stream", app.StreamHandler)
	mux.HandleFunc("GET /api/search", app.SearchHandler)

	// Wrap mux with CORS middleware from internal/middleware
	handler := middleware.CORSMiddleware(mux)

	// Define our HTTP server with robust, production-ready timeouts
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      handler,
		ReadTimeout:  10 * time.Second,  // Max duration for reading the entire request (prevents slowloris)
		WriteTimeout: 10 * time.Second,  // Max duration before timing out writes of the response
		IdleTimeout:  120 * time.Second, // Max amount of time to keep keep-alive connections idle
	}

	// Channel to listen for HTTP server run failures
	shutdownError := make(chan error)

	go func() {
		slog.Info("Starting backend server", "port", port, "url", "http://localhost:"+port)
		
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
