package main

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

// Global variables for app metadata
var (
	version   = "0.1.0"
	startTime = time.Now()
)

// HealthResponse represents the structure of our health check response
type HealthResponse struct {
	Status    string    `json:"status"`
	Version   string    `json:"version"`
	Uptime    string    `json:"uptime"`
	Timestamp time.Time `json:"timestamp"`
	Services  Services  `json:"services"`
}

// Services contains placeholders for third-party services status
type Services struct {
	Database string `json:"database"`
	Cache    string `json:"cache"`
}

func main() {
	// Initialize modern structured logging (slog) using Text format for readability in development
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))
	slog.SetDefault(logger)

	// Get port from environment variable, fallback to standard 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Create a new ServeMux (Go 1.22+ supports HTTP methods in path patterns)
	mux := http.NewServeMux()

	// Register handlers
	mux.HandleFunc("GET /health", healthHandler)
	mux.HandleFunc("GET /api/health", healthHandler)

	// Wrap mux with CORS middleware so frontend can interact with it
	handler := corsMiddleware(mux)

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

// healthHandler handles GET /health and GET /api/health
func healthHandler(w http.ResponseWriter, r *http.Request) {
	resp := HealthResponse{
		Status:    "OK",
		Version:   version,
		Uptime:    time.Since(startTime).Round(time.Second).String(),
		Timestamp: time.Now(),
		Services: Services{
			Database: "disconnected (not configured)",
			Cache:    "disconnected (not configured)",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(resp); err != nil {
		slog.Error("Failed to encode health response", "error", err)
	}
}

// corsMiddleware is a custom middleware function to handle Cross-Origin requests
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow requests from Next.js local server
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle HTTP OPTIONS preflight request
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
