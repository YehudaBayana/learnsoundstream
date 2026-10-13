package videos

import (
	"backend/internal/config"
	"context"
	"errors"
	"fmt"
	"log/slog"
	"path/filepath"
	"time"

	"backend/internal/storage"

	"github.com/google/uuid"
)

// Settings are the limits and URL lifetimes the Service enforces.
type Settings struct {
	MaxUploadBytes int64
	UploadURLTTL   time.Duration
	PlaybackURLTTL time.Duration
}

type Service struct {
	repository Repository
	store      storage.Storage
	settings   Settings
}

func NewService(repository Repository, store storage.Storage, settings Settings) *Service {
	return &Service{repository: repository, store: store, settings: settings}
}

// InitUpload validates the declared file, opens a multipart upload in storage and records the pending video.
func (service *Service) InitUpload(ctx context.Context, ownerID uuid.UUID, input InitUpload) (UploadSession, error) {
	originalName := filepath.Base(input.Filename)
	extension, supported := supportedVideoExtension(originalName)
	if !supported {
		return UploadSession{}, ErrUnsupportedFormat
	}
	if input.SizeBytes <= 0 {
		return UploadSession{}, fmt.Errorf("%w: size_bytes must be positive", ErrInvalidInput)
	}
	if input.SizeBytes > service.settings.MaxUploadBytes {
		return UploadSession{}, ErrUploadTooLarge
	}

	videoID := uuid.New()
	key := originalKey(ownerID, videoID, extension)
	mimeType := input.MimeType
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	uploadID, err := service.store.CreateMultipartUpload(ctx, key, mimeType)
	if err != nil {
		return UploadSession{}, fmt.Errorf("start upload: %w", err)
	}
	expiresAt := time.Now().Add(config.UploadSessionLifetime)
	video, err := service.repository.Create(ctx, NewVideo{
		ID:              videoID,
		OwnerID:         ownerID,
		Status:          StatusUploading,
		UploadID:        uploadID,
		UploadExpiresAt: &expiresAt,
		Title:           input.Title,
		Notes:           input.Notes,
		RecordedAt:      input.RecordedAt,
		OriginalName:    originalName,
		OriginalKey:     key,
		MimeType:        mimeType,
		SizeBytes:       input.SizeBytes,
	})
	if err != nil {
		service.abortUpload(ctx, key, uploadID)
		return UploadSession{}, fmt.Errorf("create video: %w", err)
	}
	return UploadSession{Video: video, PartSize: config.UploadPartBytes, PartCount: partCount(video.SizeBytes)}, nil
}

// PresignParts returns short-lived URLs the browser PUTs the requested parts to.
func (service *Service) PresignParts(ctx context.Context, ownerID, videoID uuid.UUID, partNumbers []int) ([]PartURL, error) {
	video, err := service.getUploading(ctx, ownerID, videoID)
	if err != nil {
		return nil, err
	}
	if err := validatePartNumbers(partNumbers, partCount(video.SizeBytes)); err != nil {
		return nil, err
	}

	urls := make([]PartURL, 0, len(partNumbers))
	for _, partNumber := range partNumbers {
		url, err := service.store.PresignUploadPart(ctx, video.OriginalKey, video.UploadID, partNumber, service.settings.UploadURLTTL)
		if err != nil {
			return nil, fmt.Errorf("presign part %d: %w", partNumber, err)
		}
		urls = append(urls, PartURL{PartNumber: partNumber, URL: url})
	}
	return urls, nil
}

// CompleteUpload assembles the parts and moves the video to processing once the stored size matches the declared one.
func (service *Service) CompleteUpload(ctx context.Context, ownerID, videoID uuid.UUID, parts []storage.CompletedPart) (Video, error) {
	video, err := service.getUploading(ctx, ownerID, videoID)
	if err != nil {
		return Video{}, err
	}
	if err := validateCompletedParts(parts, partCount(video.SizeBytes)); err != nil {
		return Video{}, err
	}

	if err := service.store.CompleteMultipartUpload(ctx, video.OriginalKey, video.UploadID, parts); err != nil {
		return Video{}, fmt.Errorf("complete upload: %w", err)
	}
	storedSize, err := service.store.Size(ctx, video.OriginalKey)
	if err != nil {
		return Video{}, fmt.Errorf("check uploaded file: %w", err)
	}
	if storedSize != video.SizeBytes {
		service.discardUpload(ctx, video)
		return Video{}, fmt.Errorf("%w: uploaded size does not match the declared size", ErrInvalidUpload)
	}

	processing, err := service.repository.MarkProcessing(ctx, ownerID, videoID, storedSize)
	if err != nil {
		return Video{}, fmt.Errorf("mark video processing: %w", err)
	}
	return processing, nil
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

// Delete removes the row first, then the unfinished upload and every stored file that belonged to it.
// It also cancels an upload the user aborted.
func (service *Service) Delete(ctx context.Context, ownerID, videoID uuid.UUID) error {
	video, err := service.repository.Delete(ctx, ownerID, videoID)
	if err != nil {
		return fmt.Errorf("delete video: %w", err)
	}

	var cleanupErr error
	if video.UploadID != "" {
		cleanupErr = service.store.AbortMultipartUpload(ctx, video.OriginalKey, video.UploadID)
	}
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

// PlaybackURL returns a presigned URL the browser streams the playback file from, with Range requests.
func (service *Service) PlaybackURL(ctx context.Context, ownerID, videoID uuid.UUID) (SignedURL, error) {
	video, err := service.Get(ctx, ownerID, videoID)
	if err != nil {
		return SignedURL{}, err
	}
	if video.Status != StatusReady || video.PlaybackKey == "" {
		return SignedURL{}, ErrNotReady
	}
	return service.signGet(ctx, video.PlaybackKey, playbackContentType)
}

func (service *Service) ThumbnailURL(ctx context.Context, ownerID, videoID uuid.UUID) (SignedURL, error) {
	video, err := service.Get(ctx, ownerID, videoID)
	if err != nil {
		return SignedURL{}, err
	}
	if video.ThumbnailKey == "" {
		return SignedURL{}, ErrNotFound
	}
	return service.signGet(ctx, video.ThumbnailKey, thumbnailContentType)
}

// CleanupExpiredUploads discards uploads the browser never finished; failures are retried on the next run.
func (service *Service) CleanupExpiredUploads(ctx context.Context) {
	expired, err := service.repository.ListExpiredUploads(ctx, time.Now())
	if err != nil {
		slog.Error("Failed to list expired uploads", "error", err)
		return
	}
	for _, video := range expired {
		if err := service.store.AbortMultipartUpload(ctx, video.OriginalKey, video.UploadID); err != nil {
			slog.Error("Failed to abort expired upload", "video_id", video.ID, "error", err)
			continue
		}
		if _, err := service.repository.Delete(ctx, video.OwnerID, video.ID); err != nil && !errors.Is(err, ErrNotFound) {
			slog.Error("Failed to delete expired upload", "video_id", video.ID, "error", err)
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

func (service *Service) getUploading(ctx context.Context, ownerID, videoID uuid.UUID) (Video, error) {
	video, err := service.Get(ctx, ownerID, videoID)
	if err != nil {
		return Video{}, err
	}
	if video.Status != StatusUploading {
		return Video{}, fmt.Errorf("%w: upload is not in progress", ErrInvalidUpload)
	}
	return video, nil
}

func (service *Service) signGet(ctx context.Context, key, contentType string) (SignedURL, error) {
	url, err := service.store.PresignGet(ctx, key, contentType, service.settings.PlaybackURLTTL)
	if err != nil {
		return SignedURL{}, fmt.Errorf("sign download url: %w", err)
	}
	return SignedURL{URL: url, ExpiresAt: time.Now().Add(service.settings.PlaybackURLTTL)}, nil
}

// discardUpload removes a finished-but-invalid upload; it ignores cancellation so aborted requests still clean up.
func (service *Service) discardUpload(ctx context.Context, video Video) {
	cleanupContext := context.WithoutCancel(ctx)
	if err := service.store.Delete(cleanupContext, video.OriginalKey); err != nil {
		slog.Error("Failed to discard uploaded file", "key", video.OriginalKey, "error", err)
	}
	if _, err := service.repository.Delete(cleanupContext, video.OwnerID, video.ID); err != nil {
		slog.Error("Failed to delete invalid upload", "video_id", video.ID, "error", err)
	}
}

func (service *Service) abortUpload(ctx context.Context, key, uploadID string) {
	if err := service.store.AbortMultipartUpload(context.WithoutCancel(ctx), key, uploadID); err != nil {
		slog.Error("Failed to abort upload", "key", key, "error", err)
	}
}
