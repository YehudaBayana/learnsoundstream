package handlers

import (
	"io"
	"log/slog"
	"net/http"
	"os/exec"
	"regexp"
	"time"
)

// StreamHandler pipes the audio stream of a YouTube video using yt-dlp
func StreamHandler(w http.ResponseWriter, r *http.Request) {
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

	// Resolve the yt-dlp binary path using the shared helper
	ytDlpPath := resolveYtDlpPath()

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
