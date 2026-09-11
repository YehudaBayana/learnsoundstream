package search

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"os/exec"
	"strings"

	"backend/internal/ytdlp"
)

// Service executes YouTube searches via yt-dlp.
type Service struct {
	ytDlpPath string
}

// NewService creates a new search Service, resolving the yt-dlp binary path at construction time.
func NewService() *Service {
	return &Service{
		ytDlpPath: ytdlp.ResolvePath(),
	}
}

// Search invokes yt-dlp to search YouTube and returns up to 10 structured results.
// It respects requestContext cancellation (e.g. client disconnect).
func (service *Service) Search(requestContext context.Context, query string) ([]SearchResult, error) {
	// ytsearch10 tells yt-dlp to return up to 10 YouTube search results
	searchQuery := fmt.Sprintf("ytsearch10:%s", query)

	// --flat-playlist: don't resolve each video (much faster, just metadata)
	// --dump-json: output one JSON object per line for each result
	// --no-download: don't download any media
	// --no-warnings: suppress non-critical yt-dlp warnings from stdout
	command := exec.CommandContext(requestContext, service.ytDlpPath,
		"--flat-playlist",
		"--dump-json",
		"--no-download",
		"--no-warnings",
		searchQuery,
	)

	// Capture stdout to read JSON lines
	standardOutput, err := command.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stdout pipe for search: %w", err)
	}

	if err := command.Start(); err != nil {
		return nil, fmt.Errorf("failed to start yt-dlp search: %w", err)
	}

	// Parse each JSON line from yt-dlp output
	var results []SearchResult
	scanner := bufio.NewScanner(standardOutput)

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
		durationSeconds := int(entry.Duration)
		durationText := ytdlp.FormatDuration(durationSeconds)

		// Build a high-quality thumbnail URL from the video ID
		thumbnail := fmt.Sprintf("https://i.ytimg.com/vi/%s/hqdefault.jpg", entry.ID)

		results = append(results, SearchResult{
			VideoID:         entry.ID,
			Title:           entry.Title,
			Channel:         channelName,
			Duration:        durationText,
			DurationSeconds: durationSeconds,
			Thumbnail:       thumbnail,
		})
	}

	// Wait for the process to finish and reclaim resources
	if err := command.Wait(); err != nil {
		// Context cancellation (client disconnect) is expected, not an error
		if requestContext.Err() != nil {
			slog.Info("Search cancelled by client", "query", query)
			return results, nil
		}
		slog.Debug("yt-dlp search process finished with info", "query", query, "info", err.Error())
	}

	if results == nil {
		results = []SearchResult{} // Ensure we return [] not null in JSON
	}

	return results, nil
}
