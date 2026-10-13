package storage_test

import (
	"context"
	"net/url"
	"testing"
	"time"

	"backend/internal/storage"
)

func newTestR2(t *testing.T) *storage.R2Storage {
	t.Helper()
	store, err := storage.NewR2Storage(storage.R2Config{
		AccountID: "account", AccessKeyID: "key", SecretAccessKey: "secret", Bucket: "dance-videos",
	})
	if err != nil {
		t.Fatalf("NewR2Storage() error = %v", err)
	}
	return store
}

func TestNewR2StorageRequiresCredentialsAndBucket(t *testing.T) {
	if _, err := storage.NewR2Storage(storage.R2Config{AccountID: "account"}); err == nil {
		t.Error("NewR2Storage() error = nil, want an error for missing credentials")
	}
	if _, err := storage.NewR2Storage(storage.R2Config{AccessKeyID: "key", SecretAccessKey: "secret", Bucket: "b"}); err == nil {
		t.Error("NewR2Storage() error = nil, want an error for a missing account or endpoint")
	}
}

func TestPresignUploadPartTargetsOneKeyAndPart(t *testing.T) {
	store := newTestR2(t)

	rawURL, err := store.PresignUploadPart(context.Background(), "owner/video/original.mp4", "upload-1", 3, time.Hour)
	if err != nil {
		t.Fatalf("PresignUploadPart() error = %v", err)
	}
	parsed, err := url.Parse(rawURL)
	if err != nil {
		t.Fatalf("parse url: %v", err)
	}
	query := parsed.Query()
	if parsed.Host != "account.r2.cloudflarestorage.com" || parsed.Path != "/dance-videos/owner/video/original.mp4" {
		t.Errorf("url = %s, want the bucket path on the account endpoint", rawURL)
	}
	if query.Get("partNumber") != "3" || query.Get("uploadId") != "upload-1" || query.Get("X-Amz-Expires") != "3600" {
		t.Errorf("query = %v, want part 3 of upload-1 expiring in 3600s", query)
	}
	if query.Get("X-Amz-Signature") == "" {
		t.Error("url is not signed")
	}
}

func TestPresignGetSetsResponseHeaders(t *testing.T) {
	store := newTestR2(t)

	rawURL, err := store.PresignGet(context.Background(), "owner/video/playback.mp4", "video/mp4", 2*time.Hour)
	if err != nil {
		t.Fatalf("PresignGet() error = %v", err)
	}
	parsed, err := url.Parse(rawURL)
	if err != nil {
		t.Fatalf("parse url: %v", err)
	}
	query := parsed.Query()
	if query.Get("response-content-type") != "video/mp4" || query.Get("X-Amz-Expires") != "7200" {
		t.Errorf("query = %v, want video/mp4 content type and a 2h expiry", query)
	}
}
