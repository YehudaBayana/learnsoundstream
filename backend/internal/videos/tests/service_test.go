package videos_test

import (
	"context"
	"errors"
	"strings"
	"testing"

	"backend/internal/storage"
	"backend/internal/videos"

	"github.com/google/uuid"
)

// repositoryStub implements only what the tests exercise; other methods panic via the nil embedded interface.
type repositoryStub struct {
	videos.Repository

	video          videos.Video
	err            error
	gotVideoIDs    []uuid.UUID
	getByIDsCalled bool
}

func (stub *repositoryStub) Create(context.Context, videos.NewVideo) (videos.Video, error) {
	return stub.video, stub.err
}

func (stub *repositoryStub) GetByID(context.Context, uuid.UUID, uuid.UUID) (videos.Video, error) {
	return stub.video, stub.err
}

func (stub *repositoryStub) GetByIDs(_ context.Context, _ uuid.UUID, videoIDs []uuid.UUID) ([]videos.Video, error) {
	stub.getByIDsCalled = true
	stub.gotVideoIDs = videoIDs
	return []videos.Video{stub.video}, stub.err
}

func (stub *repositoryStub) Delete(context.Context, uuid.UUID, uuid.UUID) (videos.Video, error) {
	return stub.video, stub.err
}

func newLocalStorage(t *testing.T) *storage.LocalStorage {
	t.Helper()
	store, err := storage.NewLocalStorage(t.TempDir())
	if err != nil {
		t.Fatalf("NewLocalStorage() error = %v", err)
	}
	return store
}

func TestGetByIDsSkipsRepositoryForEmptyRequest(t *testing.T) {
	repository := &repositoryStub{}
	service := videos.NewService(repository, newLocalStorage(t))

	got, err := service.GetByIDs(context.Background(), uuid.New(), nil)
	if err != nil {
		t.Fatalf("GetByIDs() error = %v", err)
	}
	if got == nil || len(got) != 0 {
		t.Fatalf("GetByIDs() = %#v, want empty non-nil slice", got)
	}
	if repository.getByIDsCalled {
		t.Error("repository was called for an empty request")
	}
}

func TestGetWrapsRepositoryErrorAndKeepsNotFound(t *testing.T) {
	repository := &repositoryStub{err: videos.ErrNotFound}
	service := videos.NewService(repository, newLocalStorage(t))

	_, err := service.Get(context.Background(), uuid.New(), uuid.New())
	if !errors.Is(err, videos.ErrNotFound) {
		t.Fatalf("Get() error = %v, want ErrNotFound", err)
	}
	if !strings.Contains(err.Error(), "get video") {
		t.Errorf("Get() error = %q, want it wrapped with context", err)
	}
}

func TestDeleteRemovesAllStoredFiles(t *testing.T) {
	ctx := context.Background()
	store := newLocalStorage(t)
	keys := []string{"owner/video/original.mov", "owner/video/playback.mp4", "owner/video/thumb.jpg"}
	for _, key := range keys {
		if _, err := store.Put(ctx, key, strings.NewReader("data")); err != nil {
			t.Fatalf("Put(%q) error = %v", key, err)
		}
	}
	repository := &repositoryStub{video: videos.Video{OriginalKey: keys[0], PlaybackKey: keys[1], ThumbnailKey: keys[2]}}
	service := videos.NewService(repository, store)

	if err := service.Delete(ctx, uuid.New(), uuid.New()); err != nil {
		t.Fatalf("Delete() error = %v", err)
	}
	for _, key := range keys {
		if _, err := store.Stat(ctx, key); err == nil {
			t.Errorf("file %q still exists after Delete()", key)
		}
	}
}

func TestOpenPlaybackRequiresReadyVideo(t *testing.T) {
	repository := &repositoryStub{video: videos.Video{Status: videos.StatusProcessing}}
	service := videos.NewService(repository, newLocalStorage(t))

	_, _, err := service.OpenPlayback(context.Background(), uuid.New(), uuid.New())
	if !errors.Is(err, videos.ErrNotReady) {
		t.Fatalf("OpenPlayback() error = %v, want ErrNotReady", err)
	}
}

func TestCreateDiscardsStoredOriginalWhenInsertFails(t *testing.T) {
	ctx := context.Background()
	store := newLocalStorage(t)
	const key = "owner/video/original.mp4"
	if _, err := store.Put(ctx, key, strings.NewReader("data")); err != nil {
		t.Fatalf("Put() error = %v", err)
	}
	service := videos.NewService(&repositoryStub{err: errors.New("database unavailable")}, store)

	if _, err := service.Create(ctx, videos.NewVideo{OriginalKey: key}); err == nil {
		t.Fatal("Create() error = nil, want the repository error")
	}
	if _, err := store.Stat(ctx, key); err == nil {
		t.Error("original file still exists after a failed insert")
	}
}
