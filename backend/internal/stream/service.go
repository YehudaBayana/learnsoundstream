package stream

import (
	"bufio"
	"database/sql"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"backend/internal/ytdlp"
)

type Service struct {
	ytDlpPath string
	database  *sql.DB
	tempDir   string
}

func NewService(database *sql.DB) *Service {
	// Create a temp directory for HLS segments
	tempDir := filepath.Join(os.TempDir(), "soundstream_hls")
	os.MkdirAll(tempDir, 0755)

	return &Service{
		ytDlpPath: ytdlp.ResolvePath(),
		database:  database,
		tempDir:   tempDir,
	}
}

func (service *Service) StreamManifest(request *http.Request, responseWriter http.ResponseWriter, videoID string) {
	if service.database != nil {
		go func(videoID string) {
			query := `
				INSERT INTO playback_history (user_id, id, play_count, last_played_at) 
				VALUES ($1, $2, 1, CURRENT_TIMESTAMP)
				ON CONFLICT (user_id, id) 
				DO UPDATE SET 
					play_count = playback_history.play_count + 1,
					last_played_at = CURRENT_TIMESTAMP;
			`
			userID := "1"
			_, err := service.database.Exec(query, userID, videoID)
			if err != nil {
				slog.Error("Failed to upsert playback history", "error", err, "id", videoID)
			}
		}(videoID)
	}

	videoDir := filepath.Join(service.tempDir, videoID)
	playlistPath := filepath.Join(videoDir, "playlist.m3u8")

	// If the playlist doesn't exist, generate it via yt-dlp + ffmpeg
	if _, err := os.Stat(playlistPath); os.IsNotExist(err) {
		slog.Info("Generating HLS segments", "id", videoID)
		os.MkdirAll(videoDir, 0755)

		videoURL := "https://www.youtube.com/watch?v=" + videoID

		// Get the m4a direct URL (format 140)
		ytCommand := exec.CommandContext(request.Context(), service.ytDlpPath, "-f", "140", "-g", videoURL)
		ytOutput, err := ytCommand.Output()
		if err != nil {
			slog.Error("Failed to get direct URL with yt-dlp", "error", err, "id", videoID)
			http.Error(responseWriter, "Failed to resolve media URL", http.StatusInternalServerError)
			return
		}

		directURL := strings.TrimSpace(string(ytOutput))

		// Run ffmpeg to segment it into fMP4 HLS
		// This runs synchronously and downloads/segments the entire audio quickly.
		ffmpegCommand := exec.CommandContext(request.Context(),
			"ffmpeg",
			"-i", directURL,
			"-c", "copy",
			"-f", "hls",
			"-hls_time", "10",
			"-hls_list_size", "0",
			"-hls_segment_type", "fmp4",
			playlistPath,
		)

		if err := ffmpegCommand.Run(); err != nil {
			slog.Error("Failed to segment audio with ffmpeg", "error", err, "id", videoID)
			http.Error(responseWriter, "Failed to segment audio", http.StatusInternalServerError)
			return
		}
	} else {
		slog.Info("Serving cached HLS segments", "id", videoID)
	}

	// Read the generated playlist
	manifestFile, err := os.Open(playlistPath)
	if err != nil {
		http.Error(responseWriter, "Failed to read manifest", http.StatusInternalServerError)
		return
	}
	defer manifestFile.Close()

	responseWriter.Header().Set("Content-Type", "application/vnd.apple.mpegurl")
	responseWriter.Header().Set("Cache-Control", "no-cache")
	responseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	responseWriter.WriteHeader(http.StatusOK)

	scheme := "http"
	if request.TLS != nil {
		scheme = "https"
	}
	proxyBase := fmt.Sprintf("%s://%s/api/stream/segment", scheme, request.Host)

	scanner := bufio.NewScanner(manifestFile)
	for scanner.Scan() {
		line := scanner.Text()
		
		// Rewrite EXT-X-MAP URI
		if strings.HasPrefix(line, "#EXT-X-MAP:URI=") {
			parts := strings.Split(line, "\"")
			if len(parts) >= 3 {
				fileName := parts[1] // e.g. init.mp4
				encodedFile := url.QueryEscape(fileName)
				newURI := fmt.Sprintf("%s?v=%s&file=%s", proxyBase, videoID, encodedFile)
				line = fmt.Sprintf("#EXT-X-MAP:URI=\"%s\"", newURI)
			}
		} else if len(line) > 0 && !strings.HasPrefix(line, "#") {
			// Rewrite segment file name
			fileName := line // e.g. playlist0.m4s
			encodedFile := url.QueryEscape(fileName)
			line = fmt.Sprintf("%s?v=%s&file=%s", proxyBase, videoID, encodedFile)
		}
		fmt.Fprintln(responseWriter, line)
	}
}

func (service *Service) StreamSegment(request *http.Request, responseWriter http.ResponseWriter, _ string) {
	// Our new proxy uses ?v=videoID&file=fileName
	videoID := request.URL.Query().Get("v")
	fileName := request.URL.Query().Get("file")

	if videoID == "" || fileName == "" {
		http.Error(responseWriter, "Missing parameters", http.StatusBadRequest)
		return
	}

	// Basic safety check for path traversal
	if strings.Contains(fileName, "..") || strings.Contains(fileName, "/") {
		http.Error(responseWriter, "Invalid file name", http.StatusBadRequest)
		return
	}

	filePath := filepath.Join(service.tempDir, videoID, fileName)
	file, err := os.Open(filePath)
	if err != nil {
		http.Error(responseWriter, "Segment not found", http.StatusNotFound)
		return
	}
	defer file.Close()

	responseWriter.Header().Set("Access-Control-Allow-Origin", "*")
	// Proper content type for fMP4
	if strings.HasSuffix(fileName, ".mp4") {
		responseWriter.Header().Set("Content-Type", "video/mp4")
	} else if strings.HasSuffix(fileName, ".m4s") {
		responseWriter.Header().Set("Content-Type", "video/iso.segment")
	}

	io.Copy(responseWriter, file)
}
