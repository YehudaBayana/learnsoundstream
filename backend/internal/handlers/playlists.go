package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os/exec"
	"strconv"
	"strings"
)

// SearchResult represents the top-level output from yt-dlp search
type PlaylistResponse struct {
	Entries []PlaylistInfo `json:"entries"`
}

// Thumbnail struct matching yt-dlp JSON schema
type Thumbnail struct {
	URL    string `json:"url"`
	Height int    `json:"height"`
	Width  int    `json:"width"`
}

// PlaylistInfo contains the metadata for extracted playlists
type PlaylistInfo struct {
	ID         string      `json:"id"`
	Title      string      `json:"title"`
	URL        string      `json:"url"`
	Uploader   string      `json:"uploader"`
	Channel    string      `json:"channel"`
	VideoCount int         `json:"playlist_count"`
	Thumbnails []Thumbnail `json:"thumbnails"`
	Thumbnail  string      `json:"thumbnail"`
}

type PopularPlaylistsResponse struct {
	Results []PlaylistInfo `json:"results"`
	Count   int            `json:"count"`
}

type PlaylistTrack struct {
	ID              string      `json:"id"`
	Title           string      `json:"title"`
	Channel         string      `json:"channel"`
	URL             string      `json:"url"`
	Thumbnail       string      `json:"thumbnail"`
	DurationSeconds int         `json:"durationSeconds"`
	Duration        string      `json:"duration"`
	Thumbnails      []Thumbnail `json:"thumbnails"`
}

type PlaylistTracksResponse struct {
	Tracks []PlaylistTrack `json:"tracks"`
	Count  int             `json:"count"`
}

func (app *App) PopularPlaylistsHandler(responseWriter http.ResponseWriter, request *http.Request) {
	// YouTube search URL with the playlist filter (sp=EgIQAw%3D%3D)
	// You can change 'popular+playlists' to any query terms like 'top+music'
	searchURL := "https://www.youtube.com/results?search_query=hiphop+playlists&sp=EgIQAw%3D%3D"

	args := []string{
		searchURL,
		"--flat-playlist",     // Prevents deep parsing into each video
		"--dump-json",         // Dump JSON for each item found on the search page
		"--playlist-end", "5", // Limits to top 5 playlists
		"--no-warnings",
	}

	cmd := exec.Command("yt-dlp", args...)
	output, err := cmd.Output()
	if err != nil {
		log.Fatalf("Failed to execute yt-dlp: %v", err)
	}

	// yt-dlp outputs NDJSON (newline-delimited JSON) for search result pages
	lines := strings.Split(string(output), "\n")
	var playlists []PlaylistInfo

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		var item PlaylistInfo
		if err := json.Unmarshal([]byte(line), &item); err == nil {
			// Ensure we are catching actual playlist entries
			if item.Title != "" {
				// Construct URL if missing
				if item.URL == "" && item.ID != "" {
					item.URL = fmt.Sprintf("https://www.youtube.com/playlist?list=%s", item.ID)
				}
				playlists = append(playlists, item)
			}
		}
	}

	resp := PopularPlaylistsResponse{
		Results: playlists,
		Count:   len(playlists),
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(responseWriter).Encode(resp); err != nil {
		slog.Error("Failed to encode search response", "error", err)
	}
}

// PlaylistDetails maps the single JSON object returned by yt-dlp
type PlaylistDetails struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Uploader    string `json:"uploader"`
	Channel     string `json:"channel"`
	ChannelID   string `json:"channel_id"`
	WebpageURL  string `json:"webpage_url"`
	TrackCount  int    `json:"playlist_count"`
	Thumbnails  []struct {
		URL    string `json:"url"`
		Width  int    `json:"width"`
		Height int    `json:"height"`
	} `json:"thumbnails"`
}

func (app *App) GetPlaylistDetailsHandler(responseWriter http.ResponseWriter, request *http.Request) {
	playlistId := request.URL.Query().Get("playlist_id")
	if playlistId == "" {
		http.Error(responseWriter, "Missing playlist_id", http.StatusBadRequest)
		return
	}

	// Reconstruct a full playlist URL if only an ID was provided
	playlistURL := playlistId
	if !strings.HasPrefix(playlistId, "http") {
		playlistURL = fmt.Sprintf("https://www.youtube.com/playlist?list=%s", playlistId)
	}

	args := []string{
		playlistURL,
		"--dump-single-json",    // Returns one JSON object for the entire playlist
		"--flat-playlist",       // Avoids scraping individual video pages
		"--playlist-items", "0", // Excludes individual entries from being extracted
		"--no-warnings",
	}

	cmd := exec.Command("yt-dlp", args...)
	output, err := cmd.Output()
	if err != nil {
		slog.Error("Failed to execute yt-dlp", "error", err, "playlist_id", playlistId)
		http.Error(responseWriter, "Failed to retrieve playlist details", http.StatusInternalServerError)
		return
	}

	var details PlaylistDetails
	if err := json.Unmarshal(output, &details); err != nil {
		slog.Error("Failed to parse yt-dlp output", "error", err)
		http.Error(responseWriter, "Failed to process playlist data", http.StatusInternalServerError)
		return
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(responseWriter).Encode(details); err != nil {
		slog.Error("Failed to encode playlist response", "error", err)
	}
}

func (app *App) PlaylistTracksHandler(w http.ResponseWriter, r *http.Request) {
	playlistID := r.URL.Query().Get("playlist_id")
	if playlistID == "" {
		http.Error(w, "Missing playlist_id", http.StatusBadRequest)
		return
	}

	// Pagination defaults: 1‑based, max 15 items per page
	startStr := r.URL.Query().Get("start")
	countStr := r.URL.Query().Get("count")
	start := 1
	count := 15
	if s, err := strconv.Atoi(startStr); err == nil && s > 0 {
		start = s
	}
	if c, err := strconv.Atoi(countStr); err == nil && c > 0 {
		count = c
	}
	end := start + count - 1

	searchURL := fmt.Sprintf("https://www.youtube.com/playlist?list=%s", playlistID)

	args := []string{
		searchURL,
		"--flat-playlist",
		"--dump-json",
		"--playlist-start", strconv.Itoa(start),
		"--playlist-end", strconv.Itoa(end),
		"--no-warnings",
	}

	cmd := exec.Command("yt-dlp", args...)
	output, err := cmd.Output()
	if err != nil {
		slog.Error("yt-dlp execution failed", "error", err)
		http.Error(w, "Failed to fetch playlist tracks", http.StatusInternalServerError)
		return
	}

	lines := strings.Split(string(output), "\n")
	var tracks []PlaylistTrack

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		// Flat playlist JSON structure - duration is a number (seconds)
		var flat struct {
			ID         string      `json:"id"`
			Title      string      `json:"title"`
			URL        string      `json:"url"`
			Channel    string      `json:"channel"`
			Duration   interface{} `json:"duration"` // Can be number or string
			Thumbnail  string      `json:"thumbnail"`
			Thumbnails []Thumbnail `json:"thumbnails"`
		}

		if err := json.Unmarshal([]byte(line), &flat); err != nil {
			slog.Warn("skipping malformed line", "error", err)
			continue
		}

		if flat.Title == "" {
			continue
		}

		// Handle duration which could be number or string
		var durSecs int
		var durStr string

		switch v := flat.Duration.(type) {
		case float64:
			durSecs = int(v)
			durStr = formatDuration(durSecs)
		case string:
			durStr = v
			durSecs = parseDuration(v)
		default:
			durStr = "0:00"
			durSecs = 0
		}

		track := PlaylistTrack{
			ID:              flat.ID,
			Title:           flat.Title,
			Channel:         flat.Channel,
			URL:             flat.URL,
			Thumbnail:       flat.Thumbnail,
			DurationSeconds: durSecs,
			Duration:        durStr,
			Thumbnails:      flat.Thumbnails,
		}
		tracks = append(tracks, track)
	}

	resp := PlaylistTracksResponse{
		Tracks: tracks,
		Count:  len(tracks),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		slog.Error("Failed to encode response", "error", err)
	}
}

// todo: move this to a a shared utils file
// parseDuration converts a "mm:ss" or "hh:mm:ss" string to total seconds.
func parseDuration(d string) int {
	parts := strings.Split(d, ":")
	if len(parts) == 0 {
		return 0
	}
	var total int
	for i, part := range parts {
		val, _ := strconv.Atoi(part)
		multiplier := 1
		// Rightmost part is seconds, next is minutes, next is hours...
		for j := 0; j < len(parts)-1-i; j++ {
			multiplier *= 60
		}
		total += val * multiplier
	}
	return total
}
