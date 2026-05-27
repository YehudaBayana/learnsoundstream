package handlers

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os/exec"
	"strings"
	"time"
)

// SearchResult represents a single YouTube search result returned to the client
type SearchResult struct {
	VideoID         string `json:"videoId"`
	Title           string `json:"title"`
	Channel         string `json:"channel"`
	Duration        string `json:"duration"`
	DurationSeconds int    `json:"durationSeconds"`
	Thumbnail       string `json:"thumbnail"`
}

// SearchResponse is the top-level JSON envelope for the search endpoint
type SearchResponse struct {
	Results []SearchResult `json:"results"`
	Query   string         `json:"query"`
	Count   int            `json:"count"`
}

// ytDlpEntry represents the subset of fields we care about from yt-dlp's JSON output.
// yt-dlp emits many more fields — we only unmarshal what we need.
type ytDlpEntry struct {
	ID       string  `json:"id"`
	Title    string  `json:"title"`
	Channel  string  `json:"channel"`
	Uploader string  `json:"uploader"`
	Duration float64 `json:"duration"`
}

// SearchHandler handles GET /api/search?q=<query>
// It invokes yt-dlp to search YouTube and returns structured JSON results.
func SearchHandler(responseWriter http.ResponseWriter, request *http.Request) {
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
	responseControler := http.NewResponseController(responseWriter)
	if err := responseControler.SetWriteDeadline(time.Time{}); err != nil {
		slog.Warn("Failed to clear write deadline for search", "error", err)
	}

	ytDlpPath := resolveYtDlpPath()

	// ytsearch10 tells yt-dlp to return up to 10 YouTube search results
	searchQuery := fmt.Sprintf("ytsearch10:%s", query)

	// --flat-playlist: don't resolve each video (much faster, just metadata)
	// --dump-json: output one JSON object per line for each result
	// --no-download: don't download any media
	// --no-warnings: suppress non-critical yt-dlp warnings from stdout
	cmd := exec.CommandContext(request.Context(), ytDlpPath,
		"--flat-playlist",
		"--dump-json",
		"--no-download",
		"--no-warnings",
		searchQuery,
	)

	// Capture stdout to read JSON lines
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		slog.Error("Failed to create stdout pipe for search", "error", err)
		http.Error(responseWriter, `{"error":"Internal server error"}`, http.StatusInternalServerError)
		return
	}

	if err := cmd.Start(); err != nil {
		slog.Error("Failed to start yt-dlp search", "error", err)
		http.Error(responseWriter, `{"error":"Failed to start search"}`, http.StatusInternalServerError)
		return
	}

	// Parse each JSON line from yt-dlp output
	var results []SearchResult
	scanner := bufio.NewScanner(stdout)

	// Increase scanner buffer size — some yt-dlp JSON entries can be large
	scanner.Buffer(make([]byte, 0, 256*1024), 1024*1024)

	for scanner.Scan() {
		line := scanner.Text()
		if strings.TrimSpace(line) == "" {
			continue
		}

		var entry ytDlpEntry
		if err := json.Unmarshal([]byte(line), &entry); err != nil {
			slog.Debug("Skipping unparseable yt-dlp line", "error", err)
			continue
		}

		// Skip entries without an ID (shouldn't happen, but be defensive)
		if entry.ID == "" {
			continue
		}

		// Prefer "channel" field, fall back to "uploader"
		channelName := entry.Channel
		if channelName == "" {
			channelName = entry.Uploader
		}

		// Convert duration from seconds to "m:ss" format
		durationSec := int(entry.Duration)
		durationStr := formatDuration(durationSec)

		// Build a high-quality thumbnail URL from the video ID
		thumbnail := fmt.Sprintf("https://i.ytimg.com/vi/%s/hqdefault.jpg", entry.ID)

		results = append(results, SearchResult{
			VideoID:         entry.ID,
			Title:           entry.Title,
			Channel:         channelName,
			Duration:        durationStr,
			DurationSeconds: durationSec,
			Thumbnail:       thumbnail,
		})
	}

	// Wait for the process to finish and reclaim resources
	if err := cmd.Wait(); err != nil {
		// Context cancellation (client disconnect) is expected, not an error
		if request.Context().Err() != nil {
			slog.Info("Search cancelled by client", "query", query)
			return
		}
		slog.Debug("yt-dlp search process finished with info", "query", query, "info", err.Error())
	}

	if results == nil {
		results = []SearchResult{} // Ensure we return [] not null in JSON
	}

	slog.Info("Search completed", "query", query, "results", len(results))

	resp := SearchResponse{
		Results: results,
		Query:   query,
		Count:   len(results),
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(responseWriter).Encode(resp); err != nil {
		slog.Error("Failed to encode search response", "error", err)
	}
}

// formatDuration converts a total number of seconds to a human-readable "m:ss" or "h:mm:ss" string.
func formatDuration(totalSeconds int) string {
	if totalSeconds <= 0 {
		return "0:00"
	}

	hours := totalSeconds / 3600
	minutes := (totalSeconds % 3600) / 60
	seconds := totalSeconds % 60

	if hours > 0 {
		return fmt.Sprintf("%d:%02d:%02d", hours, minutes, seconds)
	}
	return fmt.Sprintf("%d:%02d", minutes, seconds)
}
