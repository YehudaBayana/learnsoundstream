package stream

import (
	"database/sql"
	"io"
	"log/slog"
	"net/http"
	"os/exec"
	"strings"

	"backend/internal/ytdlp"
)

// Service handles audio streaming via yt-dlp and tracks playback history in the database.
type Service struct {
	ytDlpPath string
	database  *sql.DB
}

// NewService creates a new stream Service with an optional database connection.
func NewService(database *sql.DB) *Service {
	return &Service{
		ytDlpPath: ytdlp.ResolvePath(),
		database:  database,
	}
}

// Stream proxies the audio stream of a YouTube video using a direct URL from yt-dlp.
// It supports HTTP Range requests for seeking and records playback history asynchronously.
func (service *Service) Stream(request *http.Request, responseWriter http.ResponseWriter, videoID string) {
	// Async DB Insert/Update (Upsert) for playback history
	// We run this in a goroutine so it doesn't block the stream startup
	if service.database != nil {
		go func(videoID string) {
			query := `
				INSERT INTO playback_history (user_id, id, play_count, last_played_at) 
				VALUES ($1, $2, 1, CURRENT_TIMESTAMP)
				ON CONFLICT (user_id, id) 
				DO UPDATE SET 
					play_count = playback_history.play_count + 1,
					last_played_at = CURRENT_TIMESTAMP;
			`
			// Hardcoded user_id as "1" for now until Authentication is implemented
			userID := "1"
			_, err := service.database.Exec(query, userID, videoID)
			if err != nil {
				slog.Error("Failed to upsert playback history", "error", err, "id", videoID)
			} else {
				slog.Debug("Playback history updated successfully", "id", videoID)
			}
		}(videoID)
	}

	videoURL := "https://www.youtube.com/watch?v=" + videoID

	// Extract the direct audio URL using yt-dlp
	commandArguments := []string{
		"-f", "bestaudio",
		"-g", // Get direct URL
		videoURL,
	}

	command := exec.CommandContext(request.Context(), service.ytDlpPath, commandArguments...)
	
	output, err := command.Output()
	if err != nil {
		slog.Error("Failed to get audio URL with yt-dlp", "error", err, "id", videoID)
		http.Error(responseWriter, "Failed to resolve stream URL", http.StatusInternalServerError)
		return
	}

	directURL := strings.TrimSpace(string(output))
	if directURL == "" {
		slog.Error("yt-dlp returned empty URL", "id", videoID)
		http.Error(responseWriter, "Stream not found", http.StatusNotFound)
		return
	}

	// Create proxy request to the direct URL
	proxyReq, err := http.NewRequestWithContext(request.Context(), "GET", directURL, nil)
	if err != nil {
		slog.Error("Failed to create proxy request", "error", err)
		http.Error(responseWriter, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Forward the Range header to allow seeking
	if rangeHeader := request.Header.Get("Range"); rangeHeader != "" {
		proxyReq.Header.Set("Range", rangeHeader)
	}

	// Execute proxy request
	client := &http.Client{}
	resp, err := client.Do(proxyReq)
	if err != nil {
		slog.Error("Failed to fetch audio stream", "error", err)
		http.Error(responseWriter, "Failed to stream audio", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// Forward relevant headers from upstream response
	headersToForward := []string{"Content-Type", "Content-Length", "Content-Range", "Accept-Ranges"}
	for _, headerName := range headersToForward {
		if headerValue := resp.Header.Get(headerName); headerValue != "" {
			responseWriter.Header().Set(headerName, headerValue)
		}
	}
	
	// Add proper streaming and CORS headers
	responseWriter.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	responseWriter.Header().Set("X-Content-Type-Options", "nosniff")

	// Write status code (e.g., 200 OK or 206 Partial Content)
	responseWriter.WriteHeader(resp.StatusCode)

	// Stream body
	bytesWritten, err := io.Copy(responseWriter, resp.Body)
	if err != nil {
		slog.Info("Audio stream ended with write info", "id", videoID, "bytes_written", bytesWritten, "info", err.Error())
	} else {
		slog.Info("Audio stream completed successfully", "id", videoID, "bytes_written", bytesWritten)
	}
}
