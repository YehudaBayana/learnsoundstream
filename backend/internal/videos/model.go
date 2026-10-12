package videos

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

type Status string

const (
	StatusProcessing Status = "processing"
	StatusReady      Status = "ready"
	StatusFailed     Status = "failed"
)

var (
	ErrNotFound          = errors.New("video not found")
	ErrNotReady          = errors.New("video is not ready for playback")
	ErrInvalidInput      = errors.New("invalid input")
	ErrInvalidUpload     = errors.New("invalid upload")
	ErrMissingFile       = errors.New("a video file is required")
	ErrUnsupportedFormat = errors.New("supported formats are MP4, MOV, AVI, WebM, MKV, and M4V")
	ErrUploadTooLarge    = errors.New("upload exceeds the configured size limit")
)

type Video struct {
	ID            uuid.UUID  `json:"id"`
	OwnerID       uuid.UUID  `json:"owner_id"`
	Title         string     `json:"title"`
	Notes         string     `json:"notes"`
	RecordedAt    *time.Time `json:"recorded_at,omitempty"`
	Status        Status     `json:"status"`
	FailureReason string     `json:"failure_reason,omitempty"`
	OriginalName  string     `json:"original_name"`
	OriginalKey   string     `json:"original_key"`
	PlaybackKey   string     `json:"playback_key,omitempty"`
	ThumbnailKey  string     `json:"thumbnail_key,omitempty"`
	MimeType      string     `json:"mime_type,omitempty"`
	SizeBytes     int64      `json:"size_bytes"`
	DurationMs    int        `json:"duration_ms,omitempty"`
	Width         int        `json:"width,omitempty"`
	Height        int        `json:"height,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

// NewVideo is the data needed to insert an uploaded video; it always starts in StatusProcessing.
type NewVideo struct {
	ID           uuid.UUID
	OwnerID      uuid.UUID
	Title        string
	Notes        string
	RecordedAt   *time.Time
	OriginalName string
	OriginalKey  string
	MimeType     string
	SizeBytes    int64
}

// VideoUpdate holds the editable fields; a nil field is left unchanged.
type VideoUpdate struct {
	Title      *string
	Notes      *string
	RecordedAt *time.Time
}

// ProcessingResult is what the background processor learned about a video.
type ProcessingResult struct {
	PlaybackKey  string
	ThumbnailKey string
	MimeType     string
	DurationMs   int
	Width        int
	Height       int
}

type updateVideoRequest struct {
	Title      *string `json:"title"`
	Notes      *string `json:"notes"`
	RecordedAt *string `json:"recorded_at"`
}

// Repository is the persistence contract the Service depends on.
// Every method is scoped by owner, except ListProcessing which exists for startup recovery.
type Repository interface {
	Create(ctx context.Context, newVideo NewVideo) (Video, error)
	GetByID(ctx context.Context, ownerID, videoID uuid.UUID) (Video, error)
	GetByIDs(ctx context.Context, ownerID uuid.UUID, videoIDs []uuid.UUID) ([]Video, error)
	ListByOwner(ctx context.Context, ownerID uuid.UUID, limit, offset int) ([]Video, error)
	Update(ctx context.Context, ownerID, videoID uuid.UUID, update VideoUpdate) (Video, error)
	Delete(ctx context.Context, ownerID, videoID uuid.UUID) (Video, error)
	MarkReady(ctx context.Context, ownerID, videoID uuid.UUID, result ProcessingResult) error
	MarkFailed(ctx context.Context, ownerID, videoID uuid.UUID, reason string) error
	ListProcessing(ctx context.Context) ([]Video, error)
}
