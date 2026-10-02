package liked

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"
)

type Handler struct {
	repository *Repository
}

func NewHandler(repository *Repository) *Handler {
	return &Handler{repository: repository}
}

func (handler *Handler) Handle(responseWriter http.ResponseWriter, request *http.Request) {
	userID := request.URL.Query().Get("user_id")
	limit := 10
	offset := 0
	if value := request.URL.Query().Get("limit"); value != "" {
		parsedLimit, err := strconv.Atoi(value)
		if err != nil || parsedLimit < 1 {
			http.Error(responseWriter, "Invalid limit", http.StatusBadRequest)
			return
		}
		limit = parsedLimit
	}
	if value := request.URL.Query().Get("offset"); value != "" {
		parsedOffset, err := strconv.Atoi(value)
		if err != nil || parsedOffset < 0 {
			http.Error(responseWriter, "Invalid offset", http.StatusBadRequest)
			return
		}
		offset = parsedOffset
	}

	if userID == "" {
		userID = "1"
	}

	items, err := handler.repository.GetLikedVideos(request.Context(), userID, limit, offset)
	if err != nil {
		slog.Error("Failed to fetch liked videos", "error", err)
		http.Error(responseWriter, "Failed to fetch liked videos", http.StatusInternalServerError)
		return
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(responseWriter).Encode(items); err != nil {
		slog.Error("Failed to encode liked videos", "error", err)
	}
}

func (handler *Handler) HandlePost(responseWriter http.ResponseWriter, request *http.Request) {
	userID := request.URL.Query().Get("user_id")
	videoID := request.URL.Query().Get("video_id")

	if userID == "" || videoID == "" {
		http.Error(responseWriter, "Missing 'user_id' or 'video_id' parameter", http.StatusBadRequest)
		return
	}

	err := handler.repository.PostLikedVideo(request.Context(), userID, videoID)
	if err != nil {
		slog.Error("Failed to add liked video", "error", err)
		http.Error(responseWriter, "Failed to add liked video", http.StatusInternalServerError)
		return
	}

	responseWriter.WriteHeader(http.StatusOK)
}
