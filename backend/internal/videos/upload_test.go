package videos

import (
	"bytes"
	"context"
	"errors"
	"io"
	"mime/multipart"
	"strings"
	"testing"

	"backend/internal/storage"

	"github.com/google/uuid"
)

func newUploadService(t *testing.T) (*Service, *storage.LocalStorage) {
	t.Helper()
	store, err := storage.NewLocalStorage(t.TempDir())
	if err != nil {
		t.Fatalf("NewLocalStorage() error = %v", err)
	}
	return NewService(nil, store), store
}

type multipartField struct {
	name     string
	filename string
	content  string
}

func buildMultipart(t *testing.T, fields ...multipartField) *multipart.Reader {
	t.Helper()
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	for _, field := range fields {
		var part io.Writer
		var err error
		if field.filename != "" {
			part, err = writer.CreateFormFile(field.name, field.filename)
		} else {
			part, err = writer.CreateFormField(field.name)
		}
		if err != nil {
			t.Fatalf("create multipart part: %v", err)
		}
		if _, err := part.Write([]byte(field.content)); err != nil {
			t.Fatalf("write multipart part: %v", err)
		}
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("close multipart writer: %v", err)
	}
	return multipart.NewReader(&body, writer.Boundary())
}

func TestReceiveUploadStoresFileAndReadsFields(t *testing.T) {
	service, store := newUploadService(t)
	ownerID, videoID := uuid.New(), uuid.New()
	reader := buildMultipart(t,
		multipartField{name: "title", content: " Salsa class "},
		multipartField{name: "recorded_at", content: "2024-05-01"},
		multipartField{name: "file", filename: "salsa.MOV", content: "video-bytes"},
	)

	upload, err := receiveUpload(context.Background(), service, reader, ownerID, videoID, 1024)
	if err != nil {
		t.Fatalf("receiveUpload() error = %v", err)
	}
	if upload.Title != "Salsa class" || upload.OriginalName != "salsa.MOV" || upload.SizeBytes != int64(len("video-bytes")) {
		t.Errorf("upload = %+v", upload)
	}
	if upload.RecordedAt == nil || upload.RecordedAt.Format("2006-01-02") != "2024-05-01" {
		t.Errorf("RecordedAt = %v, want 2024-05-01", upload.RecordedAt)
	}
	if want := originalKey(ownerID, videoID, ".mov"); upload.OriginalKey != want {
		t.Errorf("OriginalKey = %q, want %q", upload.OriginalKey, want)
	}
	if _, err := store.Stat(context.Background(), upload.OriginalKey); err != nil {
		t.Errorf("stored original missing: %v", err)
	}
}

func TestReceiveUploadDefaultsTitleToFilename(t *testing.T) {
	service, _ := newUploadService(t)
	reader := buildMultipart(t, multipartField{name: "file", filename: "first-dance.mp4", content: "x"})

	upload, err := receiveUpload(context.Background(), service, reader, uuid.New(), uuid.New(), 1024)
	if err != nil {
		t.Fatalf("receiveUpload() error = %v", err)
	}
	if upload.Title != "first-dance" {
		t.Errorf("Title = %q, want %q", upload.Title, "first-dance")
	}
}

func TestReceiveUploadRejectsInvalidUploads(t *testing.T) {
	tests := []struct {
		name    string
		fields  []multipartField
		wantErr error
	}{
		{name: "unsupported extension", fields: []multipartField{{name: "file", filename: "notes.txt", content: "x"}}, wantErr: ErrUnsupportedFormat},
		{name: "missing file", fields: []multipartField{{name: "title", content: "No file"}}, wantErr: ErrMissingFile},
		{name: "over the size limit", fields: []multipartField{{name: "file", filename: "big.mp4", content: strings.Repeat("a", 11)}}, wantErr: ErrUploadTooLarge},
		{name: "bad recorded_at", fields: []multipartField{{name: "recorded_at", content: "yesterday"}}, wantErr: ErrInvalidInput},
		{
			name: "two files",
			fields: []multipartField{
				{name: "file", filename: "a.mp4", content: "x"},
				{name: "file", filename: "b.mp4", content: "x"},
			},
			wantErr: ErrInvalidUpload,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			service, _ := newUploadService(t)
			reader := buildMultipart(t, test.fields...)

			_, err := receiveUpload(context.Background(), service, reader, uuid.New(), uuid.New(), 10)
			if !errors.Is(err, test.wantErr) {
				t.Fatalf("receiveUpload() error = %v, want %v", err, test.wantErr)
			}
		})
	}
}

func TestReceiveUploadRemovesStoredFileOnLaterFailure(t *testing.T) {
	service, store := newUploadService(t)
	ownerID, videoID := uuid.New(), uuid.New()
	reader := buildMultipart(t,
		multipartField{name: "file", filename: "dance.mp4", content: "x"},
		multipartField{name: "recorded_at", content: "not-a-date"},
	)

	if _, err := receiveUpload(context.Background(), service, reader, ownerID, videoID, 1024); err == nil {
		t.Fatal("receiveUpload() error = nil, want invalid recorded_at")
	}
	if _, err := store.Stat(context.Background(), originalKey(ownerID, videoID, ".mp4")); err == nil {
		t.Error("stored original was not removed after the upload failed")
	}
}
