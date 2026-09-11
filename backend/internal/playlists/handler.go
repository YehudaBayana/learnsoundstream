package playlists

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
)

// Handler handles HTTP requests for the playlists feature.
type Handler struct {
	repository *Repository
}

// NewHandler creates a new playlists Handler backed by the given Repository.
func NewHandler(repository *Repository) *Handler {
	return &Handler{repository: repository}
}

// HandlePopular handles GET /api/popular-playlists
func (handler *Handler) HandlePopular(responseWriter http.ResponseWriter, request *http.Request) {
	playlists, err := handler.repository.FetchPopular()
	if err != nil {
		slog.Error("Failed to fetch popular playlists", "error", err)
		http.Error(responseWriter, "Failed to fetch popular playlists", http.StatusInternalServerError)
		return
	}

	responsePayload := PopularPlaylistsResponse{
		Results: playlists,
		Count:   len(playlists),
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(responseWriter).Encode(responsePayload); err != nil {
		slog.Error("Failed to encode search response", "error", err)
	}
}

// HandleDetails handles GET /api/playlist-details?playlist_id=<id>
func (handler *Handler) HandleDetails(responseWriter http.ResponseWriter, request *http.Request) {
	playlistID := request.URL.Query().Get("playlist_id")
	if playlistID == "" {
		http.Error(responseWriter, "Missing playlist_id", http.StatusBadRequest)
		return
	}

	// Reconstruct a full playlist URL if only an ID was provided
	playlistURL := playlistID
	if !strings.HasPrefix(playlistID, "http") {
		playlistURL = fmt.Sprintf("https://www.youtube.com/playlist?list=%s", playlistID)
	}

	details, err := handler.repository.FetchDetails(playlistURL)
	if err != nil {
		slog.Error("Failed to execute yt-dlp", "error", err, "playlist_id", playlistID)
		http.Error(responseWriter, "Failed to retrieve playlist details", http.StatusInternalServerError)
		return
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(responseWriter).Encode(details); err != nil {
		slog.Error("Failed to encode playlist response", "error", err)
	}
}

// HandleTracks handles GET /api/playlist-tracks?playlist_id=<id>[&start=<n>&count=<n>]
func (handler *Handler) HandleTracks(responseWriter http.ResponseWriter, request *http.Request) {
	playlistID := request.URL.Query().Get("playlist_id")
	if playlistID == "" {
		http.Error(responseWriter, "Missing playlist_id", http.StatusBadRequest)
		return
	}

	// Pagination defaults: 1-based, max 15 items per page
	start := 1
	count := 15
	if parsedStart, err := strconv.Atoi(request.URL.Query().Get("start")); err == nil && parsedStart > 0 {
		start = parsedStart
	}
	if parsedCount, err := strconv.Atoi(request.URL.Query().Get("count")); err == nil && parsedCount > 0 {
		count = parsedCount
	}

	tracks, err := handler.repository.FetchTracks(playlistID, start, count)
	if err != nil {
		slog.Error("yt-dlp execution failed", "error", err)
		http.Error(responseWriter, "Failed to fetch playlist tracks", http.StatusInternalServerError)
		return
	}

	responsePayload := PlaylistTracksResponse{
		Tracks: tracks,
		Count:  len(tracks),
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(responseWriter).Encode(responsePayload); err != nil {
		slog.Error("Failed to encode response", "error", err)
	}
}
