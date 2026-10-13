package liked

import (
	"backend/internal/config"
	"errors"
	"log/slog"
	"net/http"
	"strconv"

	"backend/internal/auth"
	"backend/internal/httputil"
	"backend/internal/videos"

	"github.com/google/uuid"
)

type Handler struct {
	repository *Repository
}

func NewHandler(repository *Repository) *Handler {
	return &Handler{repository: repository}
}

func (handler *Handler) Handle(responseWriter http.ResponseWriter, request *http.Request) {
	limit := config.DefaultLikedListLimit
	offset := 0
	if value := request.URL.Query().Get("limit"); value != "" {
		parsedLimit, err := strconv.Atoi(value)
		if err != nil || parsedLimit < 1 {
			httputil.WriteError(responseWriter, http.StatusBadRequest, "invalid_limit", "limit must be a positive integer")
			return
		}
		limit = parsedLimit
	}
	if value := request.URL.Query().Get("offset"); value != "" {
		parsedOffset, err := strconv.Atoi(value)
		if err != nil || parsedOffset < 0 {
			httputil.WriteError(responseWriter, http.StatusBadRequest, "invalid_offset", "offset must be zero or greater")
			return
		}
		offset = parsedOffset
	}

	userID, ok := auth.UserIDFrom(request.Context())
	if !ok {
		httputil.WriteError(responseWriter, http.StatusUnauthorized, "unauthenticated", "authentication required")
		return
	}

	likedVideos, err := handler.repository.GetLikedVideos(request.Context(), userID, limit, offset)
	if err != nil {
		slog.Error("Failed to fetch liked videos", "error", err)
		httputil.WriteError(responseWriter, http.StatusInternalServerError, "internal_error", "something went wrong")
		return
	}
	httputil.WriteJSON(responseWriter, http.StatusOK, likedVideos)
}

func (handler *Handler) HandlePost(responseWriter http.ResponseWriter, request *http.Request) {
	videoID, err := uuid.Parse(request.URL.Query().Get("video_id"))
	if err != nil {
		httputil.WriteError(responseWriter, http.StatusBadRequest, "invalid_video_id", "video_id must be a valid video id")
		return
	}

	userID, ok := auth.UserIDFrom(request.Context())
	if !ok {
		httputil.WriteError(responseWriter, http.StatusUnauthorized, "unauthenticated", "authentication required")
		return
	}

	if err := handler.repository.PostLikedVideo(request.Context(), userID, videoID); err != nil {
		if errors.Is(err, videos.ErrNotFound) {
			httputil.WriteError(responseWriter, http.StatusNotFound, "video_not_found", "video not found")
			return
		}
		slog.Error("Failed to add liked video", "error", err)
		httputil.WriteError(responseWriter, http.StatusInternalServerError, "internal_error", "something went wrong")
		return
	}

	responseWriter.WriteHeader(http.StatusNoContent)
}
