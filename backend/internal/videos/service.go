package videos

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"time"

	"backend/internal/storage"

	"github.com/google/uuid"
)

type Service struct {
	repository Repository
	store      storage.Storage
}

func NewService(repository Repository, store storage.Storage) *Service {
	return &Service{repository: repository, store: store}
}

func (service *Service) Create(ctx context.Context, newVideo NewVideo) (Video, error) {
	video, err := service.repository.Create(ctx, newVideo)
	if err != nil {
		service.DiscardFiles(ctx, newVideo.OriginalKey)
		return Video{}, fmt.Errorf("create video: %w", err)
	}
	return video, nil
}

func (service *Service) Get(ctx context.Context, ownerID, videoID uuid.UUID) (Video, error) {
	video, err := service.repository.GetByID(ctx, ownerID, videoID)
	if err != nil {
		return Video{}, fmt.Errorf("get video: %w", err)
	}
	return video, nil
}

func (service *Service) GetByIDs(ctx context.Context, ownerID uuid.UUID, videoIDs []uuid.UUID) ([]Video, error) {
	if len(videoIDs) == 0 {
		return []Video{}, nil
	}
	videos, err := service.repository.GetByIDs(ctx, ownerID, videoIDs)
	if err != nil {
		return nil, fmt.Errorf("get videos: %w", err)
	}
	return videos, nil
}

func (service *Service) List(ctx context.Context, ownerID uuid.UUID, limit, offset int) ([]Video, error) {
	videos, err := service.repository.ListByOwner(ctx, ownerID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("list videos: %w", err)
	}
	return videos, nil
}

func (service *Service) Update(ctx context.Context, ownerID, videoID uuid.UUID, update VideoUpdate) (Video, error) {
	video, err := service.repository.Update(ctx, ownerID, videoID, update)
	if err != nil {
		return Video{}, fmt.Errorf("update video: %w", err)
	}
	return video, nil
}

// Delete removes the row first, then every stored file that belonged to it.
func (service *Service) Delete(ctx context.Context, ownerID, videoID uuid.UUID) error {
	video, err := service.repository.Delete(ctx, ownerID, videoID)
	if err != nil {
		return fmt.Errorf("delete video: %w", err)
	}

	var cleanupErr error
	for _, key := range []string{video.OriginalKey, video.PlaybackKey, video.ThumbnailKey} {
		if key == "" {
			continue
		}
		cleanupErr = errors.Join(cleanupErr, service.store.Delete(ctx, key))
	}
	if cleanupErr != nil {
		return fmt.Errorf("video %s deleted but files remain: %w", videoID, cleanupErr)
	}
	return nil
}

// OpenPlayback returns the playable file of a ready video.
func (service *Service) OpenPlayback(ctx context.Context, ownerID, videoID uuid.UUID) (io.ReadSeekCloser, time.Time, error) {
	video, err := service.Get(ctx, ownerID, videoID)
	if err != nil {
		return nil, time.Time{}, err
	}
	if video.Status != StatusReady || video.PlaybackKey == "" {
		return nil, time.Time{}, ErrNotReady
	}
	return service.openFile(ctx, video.PlaybackKey)
}

func (service *Service) OpenThumbnail(ctx context.Context, ownerID, videoID uuid.UUID) (io.ReadSeekCloser, time.Time, error) {
	video, err := service.Get(ctx, ownerID, videoID)
	if err != nil {
		return nil, time.Time{}, err
	}
	if video.ThumbnailKey == "" {
		return nil, time.Time{}, ErrNotFound
	}
	return service.openFile(ctx, video.ThumbnailKey)
}

func (service *Service) StoreOriginal(ctx context.Context, key string, reader io.Reader) (int64, error) {
	size, err := service.store.Put(ctx, key, reader)
	if err != nil {
		return 0, fmt.Errorf("store original: %w", err)
	}
	return size, nil
}

// DiscardFiles removes stored files after a failed upload; it ignores cancellation so aborted requests still clean up.
func (service *Service) DiscardFiles(ctx context.Context, keys ...string) {
	cleanupContext := context.WithoutCancel(ctx)
	for _, key := range keys {
		if err := service.store.Delete(cleanupContext, key); err != nil {
			slog.Error("Failed to discard stored file", "key", key, "error", err)
		}
	}
}

func (service *Service) MarkReady(ctx context.Context, video Video, result ProcessingResult) error {
	return service.repository.MarkReady(ctx, video.OwnerID, video.ID, result)
}

func (service *Service) MarkFailed(ctx context.Context, video Video, reason string) error {
	return service.repository.MarkFailed(ctx, video.OwnerID, video.ID, reason)
}

func (service *Service) ListProcessing(ctx context.Context) ([]Video, error) {
	videos, err := service.repository.ListProcessing(ctx)
	if err != nil {
		return nil, fmt.Errorf("list processing videos: %w", err)
	}
	return videos, nil
}

func (service *Service) openFile(ctx context.Context, key string) (io.ReadSeekCloser, time.Time, error) {
	file, modTime, err := service.store.Open(ctx, key)
	if err != nil {
		slog.Error("Stored file is missing or unreadable", "key", key, "error", err)
		return nil, time.Time{}, fmt.Errorf("open stored file: %w", ErrNotFound)
	}
	return file, modTime, nil
}
