package stream

import (
	"database/sql"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os/exec"

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

// Stream pipes yt-dlp audio output directly to the HTTP response writer.
// It also records playback history asynchronously so it never blocks the stream startup.
func (service *Service) Stream(request *http.Request, responseWriter http.ResponseWriter, videoID string, startOffset float64) {
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

	commandArguments := []string{
		"-f", "bestaudio",
		"-o", "-",
	}
	if startOffset > 0 {
		commandArguments = append(commandArguments, "--download-sections", fmt.Sprintf("*%f-inf", startOffset))
	}
	commandArguments = append(commandArguments, videoURL)

	// Create command to run yt-dlp and extract audio to stdout (-)
	// We use the request context so Go automatically signals and terminates the command on client disconnect!
	command := exec.CommandContext(request.Context(), service.ytDlpPath, commandArguments...)

	// Get stdout pipe to stream the audio data
	standardOutput, err := command.StdoutPipe()
	if err != nil {
		slog.Error("Failed to create stdout pipe", "error", err)
		http.Error(responseWriter, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Start the command in the background
	if err := command.Start(); err != nil {
		slog.Error("Failed to start yt-dlp command", "error", err)
		http.Error(responseWriter, "Failed to start stream", http.StatusInternalServerError)
		return
	}

	// Set proper streaming and CORS headers
	responseWriter.Header().Set("Content-Type", "audio/mpeg")
	responseWriter.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	responseWriter.Header().Set("Connection", "keep-alive")
	responseWriter.Header().Set("X-Content-Type-Options", "nosniff")
	responseWriter.WriteHeader(http.StatusOK)

	// Pipe the stdout directly to the HTTP response writer
	bytesWritten, err := io.Copy(responseWriter, standardOutput)
	if err != nil {
		// Connection reset by peer / broken pipe is normal when client pauses, closes tab, or skips
		slog.Info("Audio stream ended with write info", "id", videoID, "bytes_written", bytesWritten, "info", err.Error())
	} else {
		slog.Info("Audio stream completed successfully", "id", videoID, "bytes_written", bytesWritten)
	}

	// Wait for the command to finish to reclaim system/process resources
	if err := command.Wait(); err != nil {
		slog.Debug("yt-dlp process completed with info", "id", videoID, "info", err.Error())
	}
}
