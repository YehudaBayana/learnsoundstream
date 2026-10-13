package storage

import (
	"context"
	"errors"
	"time"
)

var ErrNotFound = errors.New("object not found")

// CompletedPart identifies one uploaded part of a multipart upload.
type CompletedPart struct {
	PartNumber int
	ETag       string
}

// Storage is the object store behind the videos: browsers upload and download through
// presigned URLs, the server only touches bytes for processing (Download, UploadFile).
type Storage interface {
	CreateMultipartUpload(ctx context.Context, key, contentType string) (uploadID string, err error)
	PresignUploadPart(ctx context.Context, key, uploadID string, partNumber int, ttl time.Duration) (string, error)
	CompleteMultipartUpload(ctx context.Context, key, uploadID string, parts []CompletedPart) error
	AbortMultipartUpload(ctx context.Context, key, uploadID string) error
	PresignGet(ctx context.Context, key, contentType string, ttl time.Duration) (string, error)
	// Size returns ErrNotFound when the object does not exist.
	Size(ctx context.Context, key string) (int64, error)
	Download(ctx context.Context, key, destinationPath string) error
	UploadFile(ctx context.Context, key, sourcePath, contentType string) error
	// Delete succeeds when the object is already gone.
	Delete(ctx context.Context, key string) error
}
