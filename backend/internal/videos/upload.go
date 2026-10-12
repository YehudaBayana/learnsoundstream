package videos

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

const maxFormFieldBytes = 1 << 20

// receivedUpload is the result of reading a multipart upload whose file is already in storage.
type receivedUpload struct {
	Title        string
	Notes        string
	RecordedAt   *time.Time
	OriginalName string
	OriginalKey  string
	MimeType     string
	SizeBytes    int64
}

// receiveUpload streams the "file" part straight into storage and collects the text fields.
// On any error the partially stored file is removed.
func receiveUpload(
	ctx context.Context,
	service *Service,
	multipartReader *multipart.Reader,
	ownerID, videoID uuid.UUID,
	maxUploadBytes int64,
) (upload receivedUpload, err error) {
	defer func() {
		if err != nil && upload.OriginalKey != "" {
			service.DiscardFiles(ctx, upload.OriginalKey)
		}
	}()

	for {
		part, nextErr := multipartReader.NextPart()
		if errors.Is(nextErr, io.EOF) {
			break
		}
		if nextErr != nil {
			return upload, uploadReadError(nextErr)
		}

		if part.FormName() == "file" {
			err = receiveFilePart(ctx, service, part, &upload, ownerID, videoID, maxUploadBytes)
		} else {
			err = receiveFieldPart(part, &upload)
		}
		_ = part.Close()
		if err != nil {
			return upload, err
		}
	}

	if upload.OriginalKey == "" {
		return upload, ErrMissingFile
	}
	if upload.Title == "" {
		upload.Title = strings.TrimSuffix(upload.OriginalName, filepath.Ext(upload.OriginalName))
	}
	return upload, nil
}

func receiveFilePart(
	ctx context.Context,
	service *Service,
	part *multipart.Part,
	upload *receivedUpload,
	ownerID, videoID uuid.UUID,
	maxUploadBytes int64,
) error {
	if part.FileName() == "" {
		return nil
	}
	if upload.OriginalKey != "" {
		return fmt.Errorf("%w: only one video file is allowed", ErrInvalidUpload)
	}

	originalName := filepath.Base(part.FileName())
	extension, supported := supportedVideoExtension(originalName)
	if !supported {
		return ErrUnsupportedFormat
	}

	key := originalKey(ownerID, videoID, extension)
	// One extra byte lets us detect a file that is exactly over the limit.
	written, err := service.StoreOriginal(ctx, key, io.LimitReader(part, maxUploadBytes+1))
	if err != nil {
		service.DiscardFiles(ctx, key)
		if isMaxBytesError(err) {
			return ErrUploadTooLarge
		}
		return err
	}
	if written > maxUploadBytes {
		service.DiscardFiles(ctx, key)
		return ErrUploadTooLarge
	}

	upload.OriginalName = originalName
	upload.OriginalKey = key
	upload.MimeType = part.Header.Get("Content-Type")
	upload.SizeBytes = written
	return nil
}

func receiveFieldPart(part *multipart.Part, upload *receivedUpload) error {
	rawValue, err := io.ReadAll(io.LimitReader(part, maxFormFieldBytes+1))
	if err != nil {
		return uploadReadError(err)
	}
	if len(rawValue) > maxFormFieldBytes {
		return fmt.Errorf("%w: field %q is too large", ErrInvalidUpload, part.FormName())
	}
	value := strings.TrimSpace(string(rawValue))

	switch part.FormName() {
	case "title":
		upload.Title = value
	case "notes":
		upload.Notes = value
	case "recorded_at":
		recordedAt, err := parseRecordedAt(value)
		if err != nil {
			return err
		}
		upload.RecordedAt = recordedAt
	}
	return nil
}

// uploadReadError classifies a failure to read the multipart body; details stay in the log, not the response.
func uploadReadError(err error) error {
	if isMaxBytesError(err) {
		return ErrUploadTooLarge
	}
	slog.Warn("Unreadable multipart upload", "error", err)
	return ErrInvalidUpload
}

func isMaxBytesError(err error) bool {
	var maxBytesError *http.MaxBytesError
	return errors.As(err, &maxBytesError)
}
