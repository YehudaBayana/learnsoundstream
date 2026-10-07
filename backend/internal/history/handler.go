package history

import (
	"backend/internal/auth"
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
	session := auth.SessionFrom(request.Context())
	items, err := handler.repository.GetPlaybackHistory(request.Context(), session.UserID, limit, offset)
	if err != nil {
		slog.Error("Failed to fetch history", "error", err)
		http.Error(responseWriter, "Failed to fetch history", http.StatusInternalServerError)
		return
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(responseWriter).Encode(items); err != nil {
		slog.Error("Failed to encode playback history", "error", err)
	}
}
