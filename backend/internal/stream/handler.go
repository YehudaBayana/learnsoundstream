package stream

import (
	"log/slog"
	"net/http"
	"regexp"
	"strconv"
	"time"
)

// Handler handles HTTP requests for the audio streaming feature.
type Handler struct {
	service *Service
}

// NewHandler creates a new stream Handler backed by the given Service.
func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// Handle handles GET /api/stream?v=<videoID>[&ss=<startSeconds>]
// It pipes the audio stream of a YouTube video using yt-dlp.
func (handler *Handler) Handle(responseWriter http.ResponseWriter, request *http.Request) {
	videoID := request.URL.Query().Get("v")
	if videoID == "" {
		http.Error(responseWriter, "Missing 'v' parameter", http.StatusBadRequest)
		return
	}

	// Safety check: prevent command injection by strictly validating the YouTube video ID (alphanumeric, underscore, hyphen, 11 chars)
	matched, err := regexp.MatchString("^[a-zA-Z0-9_-]{11}$", videoID)
	if err != nil || !matched {
		http.Error(responseWriter, "Invalid video ID format", http.StatusBadRequest)
		return
	}

	startSecondsString := request.URL.Query().Get("ss")
	var startOffset float64
	if startSecondsString != "" {
		parsedOffset, err := strconv.ParseFloat(startSecondsString, 64)
		if err != nil || parsedOffset < 0 {
			http.Error(responseWriter, "Invalid 'ss' parameter", http.StatusBadRequest)
			return
		}
		startOffset = parsedOffset
	}

	if startOffset > 0 {
		slog.Info("Starting audio stream", "id", videoID, "start_offset", startOffset)
	} else {
		slog.Info("Starting audio stream", "id", videoID)
	}

	// In Go 1.20+, we can dynamically bypass the server's WriteTimeout for this long-lived streaming connection.
	responseController := http.NewResponseController(responseWriter)
	if err := responseController.SetWriteDeadline(time.Time{}); err != nil {
		slog.Warn("Failed to clear write deadline, streaming might time out", "error", err)
	}

	handler.service.Stream(request, responseWriter, videoID, startOffset)
}
