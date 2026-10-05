package stream

import (
	"context"
	"log/slog"
	"net/http"
	"os/exec"
	"strings"
	"sync"
	"time"

	"backend/internal/ytdlp"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	ytDlpPath string
	database  *pgxpool.Pool
	urlCache  sync.Map
}

type cachedURL struct {
	url       string
	expiresAt time.Time
}

func NewService(database *pgxpool.Pool) *Service {
	return &Service{
		ytDlpPath: ytdlp.ResolvePath(),
		database:  database,
	}
}

func (service *Service) StreamManifest(request *http.Request, responseWriter http.ResponseWriter, videoID string) {
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
			userID := "1"
			_, err := service.database.Exec(context.Background(), query, userID, videoID)
			if err != nil {
				slog.Error("Failed to upsert playback history", "error", err, "id", videoID)
			}
		}(videoID)
	}

	directURL := ""
	if cached, ok := service.urlCache.Load(videoID); ok {
		c := cached.(cachedURL)
		if time.Now().Before(c.expiresAt) {
			directURL = c.url
		}
	}

	if directURL == "" {
		videoURL := "https://www.youtube.com/watch?v=" + videoID
		ytCommand := exec.CommandContext(request.Context(), service.ytDlpPath, "-f", "140", "-g", videoURL)
		ytOutput, err := ytCommand.Output()
		if err != nil {
			slog.Error("Failed to get direct URL with yt-dlp", "error", err, "id", videoID)
			http.Error(responseWriter, "Failed to resolve media URL", http.StatusInternalServerError)
			return
		}
		directURL = strings.TrimSpace(string(ytOutput))
		service.urlCache.Store(videoID, cachedURL{
			url:       directURL,
			expiresAt: time.Now().Add(4 * time.Hour),
		})
	}

	// Set CORS headers so the browser allows direct streaming
	responseWriter.Header().Set("Access-Control-Allow-Origin", "*")

	// Redirect the browser directly to the Google/YouTube media stream URL.
	// This allows the browser to handle HTTP Range requests and long streaming natively.
	http.Redirect(responseWriter, request, directURL, http.StatusTemporaryRedirect)
}
