//go:build integration

package videos_test

import (
	"context"
	"testing"

	"backend/internal/testutils"
	"backend/internal/videos"
	"github.com/google/uuid"
)

func TestDatabaseRepositoryUpsertsAndPreservesRequestedOrder(t *testing.T) {
	db := testutils.OpenTestDB(t)
	firstID := "t" + uuid.NewString()[:10]
	secondID := "t" + uuid.NewString()[:10]
	t.Cleanup(func() {
		if _, err := db.Exec(context.Background(), "DELETE FROM video WHERE id = ANY($1)", []string{firstID, secondID}); err != nil {
			t.Errorf("delete test videos: %v", err)
		}
	})

	repository := videos.NewRepository(db)
	ctx := context.Background()
	err := repository.UpsertMany(ctx, []videos.Video{
		{ID: firstID, Title: "First title", Channel: "Channel A", Duration: 100},
		{ID: secondID, Title: "Second title", Channel: "Channel B", Duration: 200},
		{ID: "", Title: "Missing ID"},
		{ID: "skip-title", Title: ""},
	})
	if err != nil {
		t.Fatalf("UpsertMany() error = %v", err)
	}

	got, err := repository.GetByIDs(ctx, []string{secondID, "not-found", firstID})
	if err != nil {
		t.Fatalf("GetByIDs() error = %v", err)
	}
	if len(got) != 2 || got[0].ID != secondID || got[1].ID != firstID {
		t.Fatalf("GetByIDs() = %#v, want requested order [%s %s]", got, secondID, firstID)
	}
	if got[0].URL != "https://www.youtube.com/watch?v="+secondID || got[1].Thumbnail != "https://i.ytimg.com/vi/"+firstID+"/hqdefault.jpg" {
		t.Errorf("derived video fields were not populated: %#v", got)
	}

	err = repository.UpsertMany(ctx, []videos.Video{{ID: firstID, Title: "Updated title", Duration: 300}})
	if err != nil {
		t.Fatalf("update existing video: %v", err)
	}
	updated, err := repository.GetByIDs(ctx, []string{firstID})
	if err != nil {
		t.Fatalf("GetByIDs() after update: %v", err)
	}
	if len(updated) != 1 || updated[0].Title != "Updated title" || updated[0].Duration != 300 {
		t.Errorf("updated video = %#v", updated)
	}
}
