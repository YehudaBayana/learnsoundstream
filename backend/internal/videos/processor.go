package videos

import (
	"backend/internal/config"
	"context"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"

	"backend/internal/storage"
)

const queueFullReason = "processing queue full"

// Processor turns uploaded originals into browser-playable videos, one at a time.
type Processor struct {
	service *Service
	store   storage.Storage
	queue   chan Video
}

func NewProcessor(service *Service, store storage.Storage) *Processor {
	return &Processor{
		service: service,
		store:   store,
		queue:   make(chan Video, config.ProcessingQueueSize),
	}
}

// Start runs the worker until ctx is cancelled, re-queues videos left in processing by a previous run
// and starts the cleanup of abandoned uploads.
func (processor *Processor) Start(ctx context.Context) {
	go processor.work(ctx)
	go processor.recoverInterrupted(ctx)
	StartUploadJanitor(ctx, processor.service)
}

func (processor *Processor) Enqueue(video Video) {
	select {
	case processor.queue <- video:
	default:
		if err := processor.service.MarkFailed(context.Background(), video, queueFullReason); err != nil {
			slog.Error("Failed to mark video as failed", "video_id", video.ID, "error", err)
		}
	}
}

func (processor *Processor) work(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case video := <-processor.queue:
			processor.process(ctx, video)
		}
	}
}

func (processor *Processor) recoverInterrupted(ctx context.Context) {
	interrupted, err := processor.service.ListProcessing(ctx)
	if err != nil {
		slog.Error("Failed to recover videos stuck in processing", "error", err)
		return
	}
	for _, video := range interrupted {
		// Block instead of Enqueue so a large backlog is never marked as "queue full".
		select {
		case processor.queue <- video:
		case <-ctx.Done():
			return
		}
	}
}

func (processor *Processor) process(ctx context.Context, video Video) {
	taskContext, cancel := context.WithTimeout(ctx, config.ProcessingTimeout)
	defer cancel()

	result, err := processor.createPlaybackAssets(taskContext, video)
	if ctx.Err() != nil {
		// Shutting down: the video stays in processing and is picked up again on the next start.
		return
	}
	if err != nil {
		slog.Error("Video processing failed", "video_id", video.ID, "error", err)
		if markErr := processor.service.MarkFailed(ctx, video, err.Error()); markErr != nil {
			slog.Error("Failed to mark video as failed", "video_id", video.ID, "error", markErr)
		}
		return
	}
	if err := processor.service.MarkReady(ctx, video, result); err != nil {
		slog.Error("Failed to mark video as ready", "video_id", video.ID, "error", err)
	}
}

// createPlaybackAssets validates the original, then stores a faststart MP4 and a thumbnail next to it.
func (processor *Processor) createPlaybackAssets(ctx context.Context, video Video) (ProcessingResult, error) {
	workDir, err := os.MkdirTemp("", "video-processing-*")
	if err != nil {
		return ProcessingResult{}, fmt.Errorf("create work directory: %w", err)
	}
	defer os.RemoveAll(workDir)

	originalPath := filepath.Join(workDir, "original"+filepath.Ext(video.OriginalKey))
	// ffmpeg needs a seekable local file, so the original is downloaded first.
	if err := processor.store.Download(ctx, video.OriginalKey, originalPath); err != nil {
		return ProcessingResult{}, fmt.Errorf("download original: %w", err)
	}

	probe, err := probeVideo(ctx, originalPath)
	if err != nil {
		return ProcessingResult{}, fmt.Errorf("validate video: %w", err)
	}

	playbackPath := filepath.Join(workDir, "playback.mp4")
	if err := transcodeForPlayback(ctx, originalPath, playbackPath); err != nil {
		return ProcessingResult{}, fmt.Errorf("transcode video: %w", err)
	}
	thumbnailPath := filepath.Join(workDir, "thumb.jpg")
	if err := extractThumbnail(ctx, originalPath, thumbnailPath); err != nil {
		return ProcessingResult{}, fmt.Errorf("create thumbnail: %w", err)
	}

	playbackStorageKey := playbackKey(video.OwnerID, video.ID)
	if err := processor.store.UploadFile(ctx, playbackStorageKey, playbackPath, playbackContentType); err != nil {
		return ProcessingResult{}, fmt.Errorf("store playback file: %w", err)
	}
	thumbnailStorageKey := thumbnailKey(video.OwnerID, video.ID)
	if err := processor.store.UploadFile(ctx, thumbnailStorageKey, thumbnailPath, thumbnailContentType); err != nil {
		return ProcessingResult{}, fmt.Errorf("store thumbnail: %w", err)
	}

	return ProcessingResult{
		PlaybackKey:  playbackStorageKey,
		ThumbnailKey: thumbnailStorageKey,
		MimeType:     playbackContentType,
		DurationMs:   probe.DurationMs,
		Width:        probe.Width,
		Height:       probe.Height,
	}, nil
}
