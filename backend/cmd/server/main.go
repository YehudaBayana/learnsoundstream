package main

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"regexp"
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
	mux.HandleFunc("GET /api/stream", streamHandler)

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

// streamHandler pipes the audio stream of a YouTube video using yt-dlp
func streamHandler(w http.ResponseWriter, r *http.Request) {
	videoID := r.URL.Query().Get("v")
	if videoID == "" {
		http.Error(w, "Missing 'v' parameter", http.StatusBadRequest)
		return
	}

	// Safety check: prevent command injection by strictly validating the YouTube video ID (alphanumeric, underscore, hyphen, 11 chars)
	matched, err := regexp.MatchString("^[a-zA-Z0-9_-]{11}$", videoID)
	if err != nil || !matched {
		http.Error(w, "Invalid video ID format", http.StatusBadRequest)
		return
	}

	slog.Info("Starting audio stream", "video_id", videoID)

	// In Go 1.20+, we can dynamically bypass the server's WriteTimeout for this long-lived streaming connection.
	rc := http.NewResponseController(w)
	if err := rc.SetWriteDeadline(time.Time{}); err != nil {
		slog.Warn("Failed to clear write deadline, streaming might time out", "error", err)
	}

	// Safely resolve the absolute path to yt-dlp, falling back to typical installation directories
	ytDlpPath := "yt-dlp"
	if p, err := exec.LookPath("yt-dlp"); err == nil {
		ytDlpPath = p
	} else if _, err := os.Stat("/opt/homebrew/bin/yt-dlp"); err == nil {
		ytDlpPath = "/opt/homebrew/bin/yt-dlp"
	} else if _, err := os.Stat("/usr/local/bin/yt-dlp"); err == nil {
		ytDlpPath = "/usr/local/bin/yt-dlp"
	}

	videoURL := "https://www.youtube.com/watch?v=" + videoID

	// Create command to run yt-dlp and extract audio to stdout (-)
	// We use the request context so Go automatically signals and terminates the command on client disconnect!
	cmd := exec.CommandContext(r.Context(), ytDlpPath,
		"-f", "bestaudio",
		"-o", "-",
		videoURL,
	)

	// Get stdout pipe to stream the audio data
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		slog.Error("Failed to create stdout pipe", "error", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Start the command in the background
	if err := cmd.Start(); err != nil {
		slog.Error("Failed to start yt-dlp command", "error", err)
		http.Error(w, "Failed to start stream", http.StatusInternalServerError)
		return
	}

	// Set proper streaming and CORS headers
	w.Header().Set("Content-Type", "audio/mpeg")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusOK)

	// Pipe the stdout directly to the HTTP response writer
	bytesWritten, err := io.Copy(w, stdout)
	if err != nil {
		// Connection reset by peer / broken pipe is normal when client pauses, closes tab, or skips
		slog.Info("Audio stream ended with write info", "video_id", videoID, "bytes_written", bytesWritten, "info", err.Error())
	} else {
		slog.Info("Audio stream completed successfully", "video_id", videoID, "bytes_written", bytesWritten)
	}

	// Wait for the command to finish to reclaim system/process resources
	if err := cmd.Wait(); err != nil {
		slog.Debug("yt-dlp process completed with info", "video_id", videoID, "info", err.Error())
	}
}
