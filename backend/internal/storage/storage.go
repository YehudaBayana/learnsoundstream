package storage

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Storage abstracts persistent file storage behind a simple interface.
type Storage interface {
	Put(ctx context.Context, key string, reader io.Reader) (int64, error)
	Open(ctx context.Context, key string) (io.ReadSeekCloser, time.Time, error)
	Delete(ctx context.Context, key string) error
	Stat(ctx context.Context, key string) (os.FileInfo, error)
}

// LocalStorage stores files on a local filesystem rooted at the configured dir.
type LocalStorage struct {
	root string
}

func NewLocalStorage(root string) (*LocalStorage, error) {
	if root == "" {
		root = "./data/videos"
	}
	if err := os.MkdirAll(root, 0o755); err != nil {
		return nil, fmt.Errorf("create storage root: %w", err)
	}
	return &LocalStorage{root: root}, nil
}

func (store *LocalStorage) Put(ctx context.Context, key string, reader io.Reader) (int64, error) {
	fullPath, err := store.resolvePath(key)
	if err != nil {
		return 0, err
	}
	if err := os.MkdirAll(filepath.Dir(fullPath), 0o755); err != nil {
		return 0, fmt.Errorf("create storage dir: %w", err)
	}

	tmpFile, err := os.CreateTemp(filepath.Dir(fullPath), ".upload-*")
	if err != nil {
		return 0, fmt.Errorf("create temp file: %w", err)
	}
	tmpPath := tmpFile.Name()
	defer func() {
		_ = tmpFile.Close()
		_ = os.Remove(tmpPath)
	}()

	written, err := io.Copy(tmpFile, reader)
	if err != nil {
		return 0, fmt.Errorf("copy file contents: %w", err)
	}
	if err := tmpFile.Close(); err != nil {
		return 0, fmt.Errorf("close temp file: %w", err)
	}
	if err := os.Rename(tmpPath, fullPath); err != nil {
		return 0, fmt.Errorf("persist storage file: %w", err)
	}

	select {
	case <-ctx.Done():
		_ = os.Remove(fullPath)
		return 0, ctx.Err()
	default:
	}
	return written, nil
}

func (store *LocalStorage) Open(ctx context.Context, key string) (io.ReadSeekCloser, time.Time, error) {
	fullPath, err := store.resolvePath(key)
	if err != nil {
		return nil, time.Time{}, err
	}
	file, err := os.Open(fullPath)
	if err != nil {
		return nil, time.Time{}, fmt.Errorf("open storage file: %w", err)
	}
	info, err := file.Stat()
	if err != nil {
		_ = file.Close()
		return nil, time.Time{}, fmt.Errorf("stat storage file: %w", err)
	}
	select {
	case <-ctx.Done():
		_ = file.Close()
		return nil, time.Time{}, ctx.Err()
	default:
	}
	return file, info.ModTime(), nil
}

func (store *LocalStorage) Delete(ctx context.Context, key string) error {
	fullPath, err := store.resolvePath(key)
	if err != nil {
		return err
	}
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
	}
	if err := os.Remove(fullPath); err != nil && !errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("delete storage file: %w", err)
	}
	return nil
}

func (store *LocalStorage) Stat(ctx context.Context, key string) (os.FileInfo, error) {
	fullPath, err := store.resolvePath(key)
	if err != nil {
		return nil, err
	}
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}
	info, err := os.Stat(fullPath)
	if err != nil {
		return nil, fmt.Errorf("stat storage file: %w", err)
	}
	return info, nil
}

func (store *LocalStorage) resolvePath(key string) (string, error) {
	cleaned := filepath.Clean(filepath.FromSlash(key))
	if key == "" || filepath.IsAbs(cleaned) || cleaned == "." || cleaned == ".." || strings.HasPrefix(cleaned, ".."+string(filepath.Separator)) {
		return "", fmt.Errorf("invalid storage key: %q", key)
	}
	return filepath.Join(store.root, cleaned), nil
}
