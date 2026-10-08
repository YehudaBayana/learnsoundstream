//go:build integration

package history_test

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"

	"backend/internal/auth"
	"backend/internal/history"
	"backend/internal/testutils"
	"backend/internal/videos"

	"github.com/google/uuid"
)

func TestAuthenticatedHistoryEndpointReturnsVideoMetadata(t *testing.T) {
	db := testutils.OpenTestDB(t)
	fixture := testutils.SeedAuthUser(t, db)
	videoID := "h" + uuid.NewString()[:10]
	t.Cleanup(func() {
		if _, err := db.Exec(context.Background(), "DELETE FROM playback_history WHERE user_id = $1", fixture.ID.String()); err != nil {
			t.Errorf("delete test playback history: %v", err)
		}
		if _, err := db.Exec(context.Background(), "DELETE FROM video WHERE id = $1", videoID); err != nil {
			t.Errorf("delete test video: %v", err)
		}
	})

	videoRepository := videos.NewRepository(db)
	if err := videoRepository.UpsertMany(context.Background(), []videos.Video{{
		ID: videoID, Title: "History track", Channel: "History channel", Duration: 91,
	}}); err != nil {
		t.Fatalf("seed video metadata: %v", err)
	}
	if _, err := db.Exec(context.Background(), `
		INSERT INTO playback_history (user_id, id, play_count, last_played_at)
		VALUES ($1, $2, 2, CURRENT_TIMESTAMP)
	`, fixture.ID.String(), videoID); err != nil {
		t.Fatalf("seed playback history: %v", err)
	}

	handler := history.NewHandler(history.NewRepository(db, videos.NewService(videoRepository)))
	authorized := auth.NewSessionStore(db).Auth(http.HandlerFunc(handler.Handle))
	cookie := &http.Cookie{Name: auth.SessionCookieName, Value: fixture.Token}
	response := testutils.Request(t, authorized, http.MethodGet, "/api/history", nil, nil, cookie)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body: %s", response.Code, http.StatusOK, response.Body.String())
	}
	var items []history.GetVideosInfoResult
	if err := json.Unmarshal(response.Body.Bytes(), &items); err != nil {
		t.Fatalf("decode history response: %v", err)
	}
	if len(items) != 1 || items[0].ID != videoID || items[0].Title != "History track" || items[0].Duration != 91 {
		t.Fatalf("history items = %#v", items)
	}
}
