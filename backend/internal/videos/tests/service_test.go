package videos_test

import (
	"context"
	"errors"
	"reflect"
	"strings"
	"testing"

	"backend/internal/videos"
)

type repositoryStub struct {
	gotIDs    []string
	gotVideos []videos.Video
	getErr    error
	saveErr   error
}

func (repository *repositoryStub) GetByIDs(_ context.Context, ids []string) ([]videos.Video, error) {
	repository.gotIDs = append([]string(nil), ids...)
	return []videos.Video{{ID: "video-1"}}, repository.getErr
}

func (repository *repositoryStub) UpsertMany(_ context.Context, entries []videos.Video) error {
	repository.gotVideos = append([]videos.Video(nil), entries...)
	return repository.saveErr
}

func TestGetByIDsReturnsEmptyWithoutRepositoryCall(t *testing.T) {
	repository := &repositoryStub{}
	service := videos.NewService(repository)

	got, err := service.GetByIDs(context.Background(), nil)
	if err != nil {
		t.Fatalf("GetByIDs() error = %v", err)
	}
	if got == nil || len(got) != 0 {
		t.Fatalf("GetByIDs() = %#v, want empty non-nil slice", got)
	}
	if repository.gotIDs != nil {
		t.Errorf("repository received IDs %v for an empty request", repository.gotIDs)
	}
}

func TestGetByIDsWrapsRepositoryError(t *testing.T) {
	repository := &repositoryStub{getErr: errors.New("database unavailable")}
	service := videos.NewService(repository)
	_, err := service.GetByIDs(context.Background(), []string{"video-1"})
	if err == nil || !strings.Contains(err.Error(), "get video metadata: database unavailable") {
		t.Fatalf("GetByIDs() error = %v, want wrapped repository error", err)
	}
}

func TestSaveForwardsVideosAndWrapsErrors(t *testing.T) {
	entries := []videos.Video{{ID: "video-1", Title: "Track"}}
	repository := &repositoryStub{}
	service := videos.NewService(repository)
	if err := service.Save(context.Background(), entries); err != nil {
		t.Fatalf("Save() error = %v", err)
	}
	if !reflect.DeepEqual(repository.gotVideos, entries) {
		t.Errorf("saved videos = %#v, want %#v", repository.gotVideos, entries)
	}

	repository.saveErr = errors.New("write failed")
	if err := service.Save(context.Background(), entries); err == nil || !strings.Contains(err.Error(), "save video metadata: write failed") {
		t.Fatalf("Save() error = %v, want wrapped repository error", err)
	}
}

func TestWithDerivedFields(t *testing.T) {
	got := (videos.Video{ID: "abc123"}).WithDerivedFields()
	if got.URL != "https://www.youtube.com/watch?v=abc123" {
		t.Errorf("URL = %q", got.URL)
	}
	if got.Thumbnail != "https://i.ytimg.com/vi/abc123/hqdefault.jpg" {
		t.Errorf("Thumbnail = %q", got.Thumbnail)
	}
}
