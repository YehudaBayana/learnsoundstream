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

// BatchVideosRequest represents payload or query for fetching multiple videos by IDs
type BatchVideosRequest struct {
	IDs []string `json:"ids"`
}

// BatchVideosHandler handles GET /api/videos?ids=id1,id2 or POST /api/videos (JSON: {"ids":["id1","id2"]})
// It calls yt-dlp for each video ID to retrieve full SearchResult tracks.
func (app *App) BatchVideosHandler(responseWriter http.ResponseWriter, request *http.Request) {
	var ids []string

	if request.Method == http.MethodGet {
		idsParam := strings.TrimSpace(request.URL.Query().Get("ids"))
		if idsParam != "" {
			for _, id := range strings.Split(idsParam, ",") {
				id = strings.TrimSpace(id)
				if id != "" {
					ids = append(ids, id)
				}
			}
		}
	} else if request.Method == http.MethodPost {
		var body BatchVideosRequest
		if err := json.NewDecoder(request.Body).Decode(&body); err == nil {
			ids = body.IDs
		}
	}

	if len(ids) == 0 {
		responseWriter.Header().Set("Content-Type", "application/json")
		responseWriter.WriteHeader(http.StatusOK)
		json.NewEncoder(responseWriter).Encode(SearchResponse{Results: []SearchResult{}, Count: 0})
		return
	}

	// Cap at 50 IDs max to prevent excessive process execution
	if len(ids) > 50 {
		ids = ids[:50]
	}

	slog.Info("Fetching batch videos by IDs", "count", len(ids), "ids", ids)

	responseControler := http.NewResponseController(responseWriter)
	if err := responseControler.SetWriteDeadline(time.Time{}); err != nil {
		slog.Warn("Failed to clear write deadline for batch videos", "error", err)
	}

	ytDlpPath := resolveYtDlpPath()

	// Prepare arguments: yt-dlp --dump-json --no-download --no-warnings https://www.youtube.com/watch?v=ID1 ...
	args := []string{
		"--dump-json",
		"--no-download",
		"--no-warnings",
	}

	for _, id := range ids {
		args = append(args, fmt.Sprintf("https://www.youtube.com/watch?v=%s", id))
	}

	cmd := exec.CommandContext(request.Context(), ytDlpPath, args...)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		slog.Error("Failed to create stdout pipe for batch videos", "error", err)
		http.Error(responseWriter, `{"error":"Internal server error"}`, http.StatusInternalServerError)
		return
	}

	if err := cmd.Start(); err != nil {
		slog.Error("Failed to start yt-dlp batch videos", "error", err)
		http.Error(responseWriter, `{"error":"Failed to fetch video details"}`, http.StatusInternalServerError)
		return
	}

	var results []SearchResult
	scanner := bufio.NewScanner(stdout)
	scanner.Buffer(make([]byte, 0, 256*1024), 1024*1024)

	for scanner.Scan() {
		line := scanner.Text()
		if strings.TrimSpace(line) == "" {
			continue
		}

		var entry ytDlpEntry
		if err := json.Unmarshal([]byte(line), &entry); err != nil {
			slog.Debug("Skipping unparseable yt-dlp line in batch videos", "error", err)
			continue
		}

		if entry.ID == "" {
			continue
		}

		channelName := entry.Channel
		if channelName == "" {
			channelName = entry.Uploader
		}

		durationSec := int(entry.Duration)
		durationStr := formatDuration(durationSec)
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

	if err := cmd.Wait(); err != nil {
		if request.Context().Err() != nil {
			slog.Info("Batch videos cancelled by client")
			return
		}
		slog.Debug("yt-dlp batch videos finished with info", "info", err.Error())
	}

	if results == nil {
		results = []SearchResult{}
	}

	slog.Info("Batch videos fetched successfully", "requested", len(ids), "found", len(results))

	resp := SearchResponse{
		Results: results,
		Query:   strings.Join(ids, ","),
		Count:   len(results),
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(responseWriter).Encode(resp); err != nil {
		slog.Error("Failed to encode batch videos response", "error", err)
	}
}
