package videos

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os/exec"
	"strconv"
	"strings"
)

const (
	maxCommandErrorBytes = 1000
	thumbnailWidth       = 640
)

type probeResult struct {
	DurationMs int
	Width      int
	Height     int
}

type probeOutput struct {
	Streams []probeStream `json:"streams"`
	Format  probeFormat   `json:"format"`
}

type probeStream struct {
	CodecType string `json:"codec_type"`
	Width     int    `json:"width"`
	Height    int    `json:"height"`
}

type probeFormat struct {
	Duration string `json:"duration"`
}

// probeVideo validates that the file really contains a video stream, regardless of its extension.
func probeVideo(ctx context.Context, path string) (probeResult, error) {
	output, err := runCommand(ctx, "ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", path)
	if err != nil {
		return probeResult{}, err
	}
	return parseProbeOutput(output)
}

func parseProbeOutput(output []byte) (probeResult, error) {
	var parsed probeOutput
	if err := json.Unmarshal(output, &parsed); err != nil {
		return probeResult{}, fmt.Errorf("decode ffprobe output: %w", err)
	}

	for _, stream := range parsed.Streams {
		if stream.CodecType != "video" || stream.Width == 0 || stream.Height == 0 {
			continue
		}
		durationSeconds, _ := strconv.ParseFloat(parsed.Format.Duration, 64)
		return probeResult{
			DurationMs: max(0, int(durationSeconds*1000)),
			Width:      stream.Width,
			Height:     stream.Height,
		}, nil
	}
	return probeResult{}, errors.New("no video stream found")
}

// transcodeForPlayback writes an H.264/AAC MP4 with the moov atom first so playback can start immediately.
func transcodeForPlayback(ctx context.Context, inputPath, outputPath string) error {
	_, err := runCommand(ctx, "ffmpeg",
		"-hide_banner", "-loglevel", "error", "-nostdin", "-y",
		"-i", inputPath,
		"-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
		"-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p",
		"-c:a", "aac",
		"-movflags", "+faststart",
		"-f", "mp4",
		outputPath,
	)
	return err
}

func extractThumbnail(ctx context.Context, inputPath, outputPath string) error {
	_, err := runCommand(ctx, "ffmpeg",
		"-hide_banner", "-loglevel", "error", "-nostdin", "-y",
		"-ss", "1",
		"-i", inputPath,
		"-frames:v", "1",
		"-vf", fmt.Sprintf("scale=%d:-1", thumbnailWidth),
		"-q:v", "2",
		outputPath,
	)
	return err
}

// runCommand returns stdout; on failure the error carries the tail of stderr.
func runCommand(ctx context.Context, name string, args ...string) ([]byte, error) {
	output, err := exec.CommandContext(ctx, name, args...).Output()
	if err != nil {
		var exitError *exec.ExitError
		if errors.As(err, &exitError) && len(exitError.Stderr) > 0 {
			stderr := strings.TrimSpace(string(exitError.Stderr))
			if len(stderr) > maxCommandErrorBytes {
				stderr = stderr[len(stderr)-maxCommandErrorBytes:]
			}
			return nil, fmt.Errorf("%s: %w: %s", name, err, stderr)
		}
		return nil, fmt.Errorf("%s: %w", name, err)
	}
	return output, nil
}
