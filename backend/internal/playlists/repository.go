package playlists

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"os/exec"
	"strconv"
	"strings"

	"backend/internal/videos"
	"backend/internal/ytdlp"
)

// Repository fetches playlist data from YouTube via yt-dlp.
type Repository struct {
	ytDlpPath    string
	videoService *videos.Service
}

// NewRepository creates a new playlist Repository, resolving the yt-dlp binary path at construction time.
func NewRepository(videoService *videos.Service) *Repository {
	return &Repository{
		ytDlpPath:    ytdlp.ResolvePath(),
		videoService: videoService,
	}
}

// FetchPopular retrieves the top hip-hop playlists from YouTube.
func (repository *Repository) FetchPopular() ([]PlaylistInfo, error) {
	// YouTube search URL with the playlist filter (sp=EgIQAw%3D%3D)
	// You can change 'popular+playlists' to any query terms like 'top+music'
	searchURL := "https://www.youtube.com/results?search_query=hiphop+playlists&sp=EgIQAw%3D%3D"

	commandArguments := []string{
		searchURL,
		"--flat-playlist",     // Prevents deep parsing into each video
		"--dump-json",         // Dump JSON for each item found on the search page
		"--playlist-end", "5", // Limits to top 5 playlists
		"--no-warnings",
	}

	command := exec.Command(repository.ytDlpPath, commandArguments...)
	commandOutput, err := command.Output()
	if err != nil {
		return nil, fmt.Errorf("yt-dlp execution failed: %w", err)
	}

	// yt-dlp outputs NDJSON (newline-delimited JSON) for search result pages
	lines := strings.Split(string(commandOutput), "\n")
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

	return playlists, nil
}

// FetchDetails retrieves the metadata for a single playlist.
func (repository *Repository) FetchDetails(playlistURL string) (PlaylistDetails, error) {
	commandArguments := []string{
		playlistURL,
		"--dump-single-json",    // Returns one JSON object for the entire playlist
		"--flat-playlist",       // Avoids scraping individual video pages
		"--playlist-items", "0", // Excludes individual entries from being extracted
		"--no-warnings",
	}

	command := exec.Command(repository.ytDlpPath, commandArguments...)
	commandOutput, err := command.Output()
	if err != nil {
		return PlaylistDetails{}, fmt.Errorf("yt-dlp execution failed: %w", err)
	}

	var details PlaylistDetails
	if err := json.Unmarshal(commandOutput, &details); err != nil {
		return PlaylistDetails{}, fmt.Errorf("failed to parse yt-dlp output: %w", err)
	}

	return details, nil
}

// FetchTracks retrieves a paginated slice of tracks from a playlist.
func (repository *Repository) FetchTracks(ctx context.Context, playlistID string, start, count int) ([]PlaylistTrack, error) {
	end := start + count - 1
	searchURL := fmt.Sprintf("https://www.youtube.com/playlist?list=%s", playlistID)

	commandArguments := []string{
		searchURL,
		"--flat-playlist",
		"--dump-json",
		"--playlist-start", strconv.Itoa(start),
		"--playlist-end", strconv.Itoa(end),
		"--no-warnings",
	}

	command := exec.CommandContext(ctx, repository.ytDlpPath, commandArguments...)
	commandOutput, err := command.Output()
	if err != nil {
		return nil, fmt.Errorf("yt-dlp execution failed: %w", err)
	}

	lines := strings.Split(string(commandOutput), "\n")
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

		var durationInt int
		if flat.Duration != nil {
			switch rawDuration := flat.Duration.(type) {
			case float64:
				durationInt = int(rawDuration)
			case string:
				if parsedInt, err := strconv.Atoi(rawDuration); err == nil {
					durationInt = parsedInt
				}
			}
		}

		track := PlaylistTrack{
			ID:              flat.ID,
			Title:           flat.Title,
			Channel:         flat.Channel,
			URL:             flat.URL,
			Thumbnail:       flat.Thumbnail,
			Thumbnails:      flat.Thumbnails,
			Duration:        durationInt,
		}
		tracks = append(tracks, track)
	}

	if repository.videoService != nil {
		metadata := make([]videos.Video, 0, len(tracks))
		for _, track := range tracks {
			metadata = append(metadata, videos.Video{
				ID:              track.ID,
				Title:           track.Title,
				Channel:         track.Channel,
				Duration: track.Duration,
			})
		}
		if err := repository.videoService.Save(ctx, metadata); err != nil {
			slog.Warn("failed to save playlist video metadata", "error", err)
		}
	}

	return tracks, nil
}
