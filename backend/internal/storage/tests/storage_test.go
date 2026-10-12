package storage_test

import (
	"context"
	"io"
	"strings"
	"testing"

	"backend/internal/storage"
)

func TestLocalStoragePutOpenDelete(t *testing.T) {
	ctx := context.Background()
	store, err := storage.NewLocalStorage(t.TempDir())
	if err != nil {
		t.Fatalf("NewLocalStorage() error = %v", err)
	}

	const key = "user-1/video-1/original.mp4"
	payload := "hello from storage"

	size, err := store.Put(ctx, key, strings.NewReader(payload))
	if err != nil {
		t.Fatalf("Put() error = %v", err)
	}
	if size != int64(len(payload)) {
		t.Fatalf("Put() size = %d, want %d", size, len(payload))
	}

	file, modTime, err := store.Open(ctx, key)
	if err != nil {
		t.Fatalf("Open() error = %v", err)
	}
	defer file.Close()
	if modTime.IsZero() {
		t.Fatal("Open() modTime is zero")
	}

	data, err := io.ReadAll(file)
	if err != nil {
		t.Fatalf("ReadAll() error = %v", err)
	}
	if string(data) != payload {
		t.Fatalf("stored data = %q, want %q", string(data), payload)
	}

	if err := store.Delete(ctx, key); err != nil {
		t.Fatalf("Delete() error = %v", err)
	}
}

func TestLocalStorageRejectsPathTraversal(t *testing.T) {
	ctx := context.Background()
	store, err := storage.NewLocalStorage(t.TempDir())
	if err != nil {
		t.Fatalf("NewLocalStorage() error = %v", err)
	}

	if _, err := store.Put(ctx, "../escape.txt", strings.NewReader("bad")); err == nil {
		t.Fatal("Put() accepted traversal path, want error")
	}
}
