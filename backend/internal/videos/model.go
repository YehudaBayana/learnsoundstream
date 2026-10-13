package videos

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

type Status string

const (
	StatusUploading  Status = "uploading"
	StatusProcessing Status = "processing"
	StatusReady      Status = "ready"
	StatusFailed     Status = "failed"
)

var (
	ErrNotFound          = errors.New("video not found")
	ErrNotReady          = errors.New("video is not ready for playback")
	ErrInvalidInput      = errors.New("invalid input")
	ErrInvalidUpload     = errors.New("invalid upload")
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
	UploadID      string     `json:"-"`
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

// NewVideo is the data needed to insert a video row; UploadID is set while the browser is still uploading.
type NewVideo struct {
	ID              uuid.UUID
	OwnerID         uuid.UUID
	Status          Status
	UploadID        string
	UploadExpiresAt *time.Time
	Title           string
	Notes           string
	RecordedAt      *time.Time
	OriginalName    string
	OriginalKey     string
	MimeType        string
	SizeBytes       int64
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

// InitUpload is what the browser declares before it starts uploading parts to storage.
type InitUpload struct {
	Filename   string
	SizeBytes  int64
	MimeType   string
	Title      string
	Notes      string
	RecordedAt *time.Time
}

// UploadSession tells the browser how to slice the file.
type UploadSession struct {
	Video     Video `json:"video"`
	PartSize  int64 `json:"part_size"`
	PartCount int   `json:"part_count"`
}

type PartURL struct {
	PartNumber int    `json:"part_number"`
	URL        string `json:"url"`
}

type SignedURL struct {
	URL       string    `json:"url"`
	ExpiresAt time.Time `json:"expires_at"`
}

type initUploadRequest struct {
	Filename    string  `json:"filename"`
	SizeBytes   int64   `json:"size_bytes"`
	ContentType string  `json:"content_type"`
	Title       string  `json:"title"`
	Notes       string  `json:"notes"`
	RecordedAt  *string `json:"recorded_at"`
}

type presignPartsRequest struct {
	PartNumbers []int `json:"part_numbers"`
}

type completedPartRequest struct {
	PartNumber int    `json:"part_number"`
	ETag       string `json:"etag"`
}

type completeUploadRequest struct {
	Parts []completedPartRequest `json:"parts"`
}

type updateVideoRequest struct {
	Title      *string `json:"title"`
	Notes      *string `json:"notes"`
	RecordedAt *string `json:"recorded_at"`
}

// Repository is the persistence contract the Service depends on.
// Every method is scoped by owner, except ListProcessing and ListExpiredUploads which exist for background work.
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
	MarkProcessing(ctx context.Context, ownerID, videoID uuid.UUID, sizeBytes int64) (Video, error)
	ListExpiredUploads(ctx context.Context, expiredBefore time.Time) ([]Video, error)
}
