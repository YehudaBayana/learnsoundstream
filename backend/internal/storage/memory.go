package storage

import (
	"context"
	"fmt"
	"os"
	"sort"
	"sync"
	"time"
)

// MemoryStorage is an in-memory Storage for tests; presigned URLs are fake "memory://" strings.
type MemoryStorage struct {
	mutex   sync.Mutex
	objects map[string][]byte
	uploads map[string]map[int][]byte // uploadID -> part number -> bytes
	keys    map[string]string         // uploadID -> object key
	counter int
}

func NewMemoryStorage() *MemoryStorage {
	return &MemoryStorage{
		objects: make(map[string][]byte),
		uploads: make(map[string]map[int][]byte),
		keys:    make(map[string]string),
	}
}

// PutObject stores an object directly, standing in for a finished upload.
func (store *MemoryStorage) PutObject(key string, content []byte) {
	store.mutex.Lock()
	defer store.mutex.Unlock()
	store.objects[key] = content
}

// PutPart stands in for the browser PUTting one part to its presigned URL.
func (store *MemoryStorage) PutPart(uploadID string, partNumber int, content []byte) {
	store.mutex.Lock()
	defer store.mutex.Unlock()
	store.uploads[uploadID][partNumber] = content
}

func (store *MemoryStorage) HasObject(key string) bool {
	store.mutex.Lock()
	defer store.mutex.Unlock()
	_, found := store.objects[key]
	return found
}

func (store *MemoryStorage) OpenUploads() int {
	store.mutex.Lock()
	defer store.mutex.Unlock()
	return len(store.uploads)
}

func (store *MemoryStorage) CreateMultipartUpload(_ context.Context, key, _ string) (string, error) {
	store.mutex.Lock()
	defer store.mutex.Unlock()
	store.counter++
	uploadID := fmt.Sprintf("upload-%d", store.counter)
	store.uploads[uploadID] = make(map[int][]byte)
	store.keys[uploadID] = key
	return uploadID, nil
}

func (store *MemoryStorage) PresignUploadPart(_ context.Context, key, uploadID string, partNumber int, _ time.Duration) (string, error) {
	return fmt.Sprintf("memory://%s?uploadId=%s&partNumber=%d", key, uploadID, partNumber), nil
}

func (store *MemoryStorage) CompleteMultipartUpload(_ context.Context, key, uploadID string, parts []CompletedPart) error {
	store.mutex.Lock()
	defer store.mutex.Unlock()
	uploaded, found := store.uploads[uploadID]
	if !found {
		return fmt.Errorf("unknown upload %q", uploadID)
	}
	numbers := make([]int, 0, len(parts))
	for _, part := range parts {
		numbers = append(numbers, part.PartNumber)
	}
	sort.Ints(numbers)

	var content []byte
	for _, number := range numbers {
		partContent, found := uploaded[number]
		if !found {
			return fmt.Errorf("part %d was never uploaded", number)
		}
		content = append(content, partContent...)
	}
	store.objects[key] = content
	delete(store.uploads, uploadID)
	delete(store.keys, uploadID)
	return nil
}

func (store *MemoryStorage) AbortMultipartUpload(_ context.Context, _, uploadID string) error {
	store.mutex.Lock()
	defer store.mutex.Unlock()
	delete(store.uploads, uploadID)
	delete(store.keys, uploadID)
	return nil
}

func (store *MemoryStorage) PresignGet(_ context.Context, key, _ string, _ time.Duration) (string, error) {
	return "memory://" + key, nil
}

func (store *MemoryStorage) Size(_ context.Context, key string) (int64, error) {
	store.mutex.Lock()
	defer store.mutex.Unlock()
	content, found := store.objects[key]
	if !found {
		return 0, ErrNotFound
	}
	return int64(len(content)), nil
}

func (store *MemoryStorage) Download(_ context.Context, key, destinationPath string) error {
	store.mutex.Lock()
	content, found := store.objects[key]
	store.mutex.Unlock()
	if !found {
		return ErrNotFound
	}
	return os.WriteFile(destinationPath, content, 0o600)
}

func (store *MemoryStorage) UploadFile(_ context.Context, key, sourcePath, _ string) error {
	content, err := os.ReadFile(sourcePath)
	if err != nil {
		return fmt.Errorf("read upload file: %w", err)
	}
	store.PutObject(key, content)
	return nil
}

func (store *MemoryStorage) Delete(_ context.Context, key string) error {
	store.mutex.Lock()
	defer store.mutex.Unlock()
	delete(store.objects, key)
	return nil
}
