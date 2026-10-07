package stream

import (
	"backend/internal/auth"
	"log/slog"
	"net/http"
	"regexp"
)

// Handler handles HTTP requests for the audio streaming feature.
type Handler struct {
	service *Service
}

// NewHandler creates a new stream Handler backed by the given Service.
func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// HandleManifest handles GET /api/stream/manifest?v=<videoID>
func (handler *Handler) HandleManifest(responseWriter http.ResponseWriter, request *http.Request) {
	videoID := request.URL.Query().Get("v")
	if videoID == "" {
		http.Error(responseWriter, "Missing 'v' parameter", http.StatusBadRequest)
		return
	}

	matched, err := regexp.MatchString("^[a-zA-Z0-9_-]{11}$", videoID)
	if err != nil || !matched {
		http.Error(responseWriter, "Invalid video ID format", http.StatusBadRequest)
		return
	}

	slog.Info("Fetching manifest", "id", videoID)
	session := auth.SessionFrom(request.Context())
	handler.service.StreamManifest(request, responseWriter, session.UserID, videoID)
}
