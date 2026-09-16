package history

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

type Handler struct {
	repository *Repository
}

func NewHandler(repository *Repository) *Handler{
	return &Handler{repository: repository}
}

func (handler *Handler) Handle(responseWriter http.ResponseWriter, request *http.Request){
	userID := request.URL.Query().Get("user_id");
	if userID == ""{
		userID = "1"
	}

	items, err := handler.repository.GetPlaybackHistory(userID)
	if err != nil{
		slog.Error("Failed to fetch history","error", err)
		http.Error(responseWriter, "Failed to fetch history", http.StatusInternalServerError)
		return
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(responseWriter).Encode(items); err != nil {
		slog.Error("Failed to encode playback history","error",err)
	}
}