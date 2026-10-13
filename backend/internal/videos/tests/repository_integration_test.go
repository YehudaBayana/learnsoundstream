//go:build integration

package videos_test

import (
	"context"
	"errors"
	"testing"

	"backend/internal/testutils"
	"backend/internal/videos"

	"github.com/google/uuid"
)

func newTestVideo(ownerID uuid.UUID, title string) videos.NewVideo {
	videoID := uuid.New()
	return videos.NewVideo{
		ID:           videoID,
		OwnerID:      ownerID,
		Title:        title,
		OriginalName: title + ".mp4",
		OriginalKey:  ownerID.String() + "/" + videoID.String() + "/original.mp4",
		MimeType:     "video/mp4",
		SizeBytes:    42,
	}
}

func TestRepositoryCreateStartsInProcessing(t *testing.T) {
	db := testutils.OpenTestDB(t)
	owner := testutils.SeedAuthUser(t, db)
	repository := videos.NewRepository(db)

	created, err := repository.Create(context.Background(), newTestVideo(owner.ID, "First dance"))
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	if created.Status != videos.StatusProcessing || created.OwnerID != owner.ID || created.Title != "First dance" {
		t.Errorf("Create() = %+v", created)
	}
}

func TestRepositoryScopesEveryQueryByOwner(t *testing.T) {
	ctx := context.Background()
	db := testutils.OpenTestDB(t)
	owner := testutils.SeedAuthUser(t, db)
	stranger := testutils.SeedAuthUser(t, db)
	repository := videos.NewRepository(db)
	created, err := repository.Create(ctx, newTestVideo(owner.ID, "Private dance"))
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	if _, err := repository.GetByID(ctx, stranger.ID, created.ID); !errors.Is(err, videos.ErrNotFound) {
		t.Errorf("GetByID() as stranger error = %v, want ErrNotFound", err)
	}
	newTitle := "Hijacked"
	if _, err := repository.Update(ctx, stranger.ID, created.ID, videos.VideoUpdate{Title: &newTitle}); !errors.Is(err, videos.ErrNotFound) {
		t.Errorf("Update() as stranger error = %v, want ErrNotFound", err)
	}
	if _, err := repository.Delete(ctx, stranger.ID, created.ID); !errors.Is(err, videos.ErrNotFound) {
		t.Errorf("Delete() as stranger error = %v, want ErrNotFound", err)
	}
	strangerList, err := repository.ListByOwner(ctx, stranger.ID, 10, 0)
	if err != nil || len(strangerList) != 0 {
		t.Errorf("ListByOwner() as stranger = %v, %v; want empty", strangerList, err)
	}
	strangerByIDs, err := repository.GetByIDs(ctx, stranger.ID, []uuid.UUID{created.ID})
	if err != nil || len(strangerByIDs) != 0 {
		t.Errorf("GetByIDs() as stranger = %v, %v; want empty", strangerByIDs, err)
	}
}

func TestRepositoryGetByIDsPreservesRequestedOrder(t *testing.T) {
	ctx := context.Background()
	db := testutils.OpenTestDB(t)
	owner := testutils.SeedAuthUser(t, db)
	repository := videos.NewRepository(db)
	first, err := repository.Create(ctx, newTestVideo(owner.ID, "First"))
	if err != nil {
		t.Fatalf("Create() first error = %v", err)
	}
	second, err := repository.Create(ctx, newTestVideo(owner.ID, "Second"))
	if err != nil {
		t.Fatalf("Create() second error = %v", err)
	}

	got, err := repository.GetByIDs(ctx, owner.ID, []uuid.UUID{second.ID, uuid.New(), first.ID})
	if err != nil {
		t.Fatalf("GetByIDs() error = %v", err)
	}
	if len(got) != 2 || got[0].ID != second.ID || got[1].ID != first.ID {
		t.Fatalf("GetByIDs() = %+v, want [second first]", got)
	}
}

func TestRepositoryUpdateChangesOnlyProvidedFields(t *testing.T) {
	ctx := context.Background()
	db := testutils.OpenTestDB(t)
	owner := testutils.SeedAuthUser(t, db)
	repository := videos.NewRepository(db)
	created, err := repository.Create(ctx, newTestVideo(owner.ID, "Original title"))
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	notes := "Worked on turns"
	updated, err := repository.Update(ctx, owner.ID, created.ID, videos.VideoUpdate{Notes: &notes})
	if err != nil {
		t.Fatalf("Update() error = %v", err)
	}
	if updated.Title != "Original title" || updated.Notes != notes {
		t.Errorf("Update() = %+v, want title kept and notes changed", updated)
	}
}

func TestRepositoryProcessingLifecycle(t *testing.T) {
	ctx := context.Background()
	db := testutils.OpenTestDB(t)
	owner := testutils.SeedAuthUser(t, db)
	repository := videos.NewRepository(db)
	readyVideo, err := repository.Create(ctx, newTestVideo(owner.ID, "Will be ready"))
	if err != nil {
		t.Fatalf("Create() ready error = %v", err)
	}
	failedVideo, err := repository.Create(ctx, newTestVideo(owner.ID, "Will fail"))
	if err != nil {
		t.Fatalf("Create() failed error = %v", err)
	}

	if err := repository.MarkReady(ctx, owner.ID, readyVideo.ID, videos.ProcessingResult{
		PlaybackKey: "playback.mp4", ThumbnailKey: "thumb.jpg", MimeType: "video/mp4", DurationMs: 9000, Width: 1920, Height: 1080,
	}); err != nil {
		t.Fatalf("MarkReady() error = %v", err)
	}
	if err := repository.MarkFailed(ctx, owner.ID, failedVideo.ID, "ffmpeg exploded"); err != nil {
		t.Fatalf("MarkFailed() error = %v", err)
	}

	gotReady, err := repository.GetByID(ctx, owner.ID, readyVideo.ID)
	if err != nil {
		t.Fatalf("GetByID() ready error = %v", err)
	}
	if gotReady.Status != videos.StatusReady || gotReady.PlaybackKey != "playback.mp4" || gotReady.DurationMs != 9000 {
		t.Errorf("ready video = %+v", gotReady)
	}
	gotFailed, err := repository.GetByID(ctx, owner.ID, failedVideo.ID)
	if err != nil {
		t.Fatalf("GetByID() failed error = %v", err)
	}
	if gotFailed.Status != videos.StatusFailed || gotFailed.FailureReason != "ffmpeg exploded" {
		t.Errorf("failed video = %+v", gotFailed)
	}

	stillProcessing, err := repository.ListProcessing(ctx)
	if err != nil {
		t.Fatalf("ListProcessing() error = %v", err)
	}
	for _, video := range stillProcessing {
		if video.ID == readyVideo.ID || video.ID == failedVideo.ID {
			t.Errorf("ListProcessing() returned finished video %s", video.ID)
		}
	}
}

func TestRepositoryDeleteReturnsDeletedVideo(t *testing.T) {
	ctx := context.Background()
	db := testutils.OpenTestDB(t)
	owner := testutils.SeedAuthUser(t, db)
	repository := videos.NewRepository(db)
	created, err := repository.Create(ctx, newTestVideo(owner.ID, "Short-lived"))
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	deleted, err := repository.Delete(ctx, owner.ID, created.ID)
	if err != nil || deleted.OriginalKey != created.OriginalKey {
		t.Fatalf("Delete() = %+v, %v; want the deleted row", deleted, err)
	}
	if _, err := repository.GetByID(ctx, owner.ID, created.ID); !errors.Is(err, videos.ErrNotFound) {
		t.Errorf("GetByID() after delete error = %v, want ErrNotFound", err)
	}
}
