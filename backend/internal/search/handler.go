package search

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"
	"time"
)

// Handler handles HTTP requests for the search feature.
type Handler struct {
	service *Service
}

// NewHandler creates a new search Handler backed by the given Service.
func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// Handle handles GET /api/search?q=<query>
// It invokes yt-dlp to search YouTube and returns structured JSON results.
func (handler *Handler) Handle(responseWriter http.ResponseWriter, request *http.Request) {
	query := strings.TrimSpace(request.URL.Query().Get("q"))
	if query == "" {
		http.Error(responseWriter, `{"error":"Missing 'q' query parameter"}`, http.StatusBadRequest)
		return
	}

	// Safety: cap query length to prevent abuse
	if len(query) > 200 {
		http.Error(responseWriter, `{"error":"Query too long (max 200 characters)"}`, http.StatusBadRequest)
		return
	}

	slog.Info("Starting YouTube search", "query", query)

	// Remove the server's default write deadline for this potentially slow operation.
	// yt-dlp search can take 3-8 seconds depending on network conditions.
	responseController := http.NewResponseController(responseWriter)
	if err := responseController.SetWriteDeadline(time.Time{}); err != nil {
		slog.Warn("Failed to clear write deadline for search", "error", err)
	}

	results, err := handler.service.Search(request.Context(), query)
	if err != nil {
		slog.Error("Failed to execute search", "error", err, "query", query)
		http.Error(responseWriter, `{"error":"Internal server error"}`, http.StatusInternalServerError)
		return
	}

	slog.Info("Search completed", "query", query, "results", len(results))

	responsePayload := SearchResponse{
		Results: results,
		Query:   query,
		Count:   len(results),
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(responseWriter).Encode(responsePayload); err != nil {
		slog.Error("Failed to encode search response", "error", err)
	}
}
