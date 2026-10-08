package stream

import (
	"context"
	"io"
	"log/slog"
	"net/http"
	"os/exec"
	"strings"
	"sync"
	"time"

	"backend/internal/ytdlp"

	"github.com/google/uuid"
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

func (service *Service) StreamManifest(request *http.Request, responseWriter http.ResponseWriter, userID uuid.UUID, videoID string) {
	if service.database != nil && isInitialPlaybackRequest(request) {
		if userID != uuid.Nil {
			go func(videoID string) {
				query := `
                INSERT INTO playback_history (user_id, id, play_count, last_played_at) 
                VALUES ($1, $2, 1, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id, id) 
                DO UPDATE SET 
                    play_count = playback_history.play_count + 1,
                    last_played_at = CURRENT_TIMESTAMP;
            `
				_, err := service.database.Exec(context.Background(), query, userID, videoID)
				if err != nil {
					slog.Error("Failed to upsert playback history", "error", err, "id", videoID)
				}
			}(videoID)
		}
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
		var ytStderr strings.Builder
		ytCommand.Stderr = &ytStderr
		ytOutput, err := ytCommand.Output()
		if err != nil {
			slog.Error("Failed to get direct URL with yt-dlp", "error", err, "stderr", ytStderr.String(), "id", videoID)
			http.Error(responseWriter, "Failed to resolve media URL", http.StatusInternalServerError)
			return
		}
		directURL = strings.TrimSpace(string(ytOutput))
		service.urlCache.Store(videoID, cachedURL{
			url:       directURL,
			expiresAt: time.Now().Add(4 * time.Hour),
		})
	}

	upstreamRequest, err := http.NewRequestWithContext(request.Context(), request.Method, directURL, nil)
	if err != nil {
		http.Error(responseWriter, "Failed to create media request", http.StatusInternalServerError)
		return
	}
	upstreamRequest.Header.Set("Accept-Encoding", "identity")
	if userAgent := request.UserAgent(); userAgent != "" {
		upstreamRequest.Header.Set("User-Agent", userAgent)
	}
	for _, header := range []string{"Range", "If-Range"} {
		if value := request.Header.Get(header); value != "" {
			upstreamRequest.Header.Set(header, value)
		}
	}

	upstreamResponse, err := http.DefaultClient.Do(upstreamRequest)
	if err != nil {
		slog.Error("Failed to fetch media stream", "error", err, "id", videoID)
		http.Error(responseWriter, "Failed to fetch media stream", http.StatusBadGateway)
		return
	}
	defer upstreamResponse.Body.Close()

	for _, header := range []string{
		"Accept-Ranges",
		"Cache-Control",
		"Content-Encoding",
		"Content-Length",
		"Content-Range",
		"Content-Type",
		"ETag",
		"Last-Modified",
	} {
		for _, value := range upstreamResponse.Header.Values(header) {
			responseWriter.Header().Add(header, value)
		}
	}

	responseWriter.WriteHeader(upstreamResponse.StatusCode)
	if request.Method != http.MethodHead {
		if _, err := io.Copy(responseWriter, upstreamResponse.Body); err != nil {
			slog.Debug("Media stream ended", "error", err, "id", videoID)
		}
	}
}

func isInitialPlaybackRequest(request *http.Request) bool {
	if request.Method != http.MethodGet {
		return false
	}
	rangeHeader := strings.ToLower(strings.TrimSpace(request.Header.Get("Range")))
	return rangeHeader == "" || strings.HasPrefix(rangeHeader, "bytes=0-")
}
