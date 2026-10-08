//go:build integration

package liked_test

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"

	"backend/internal/auth"
	"backend/internal/liked"
	"backend/internal/testutils"
	"backend/internal/videos"

	"github.com/google/uuid"
)

func TestAuthenticatedLikedEndpointsAreIdempotentAndReturnMetadata(t *testing.T) {
	db := testutils.OpenTestDB(t)
	fixture := testutils.SeedAuthUser(t, db)
	videoID := "l" + uuid.NewString()[:10]
	t.Cleanup(func() {
		if _, err := db.Exec(context.Background(), "DELETE FROM liked WHERE user_id = $1", fixture.ID.String()); err != nil {
			t.Errorf("delete test liked rows: %v", err)
		}
		if _, err := db.Exec(context.Background(), "DELETE FROM video WHERE id = $1", videoID); err != nil {
			t.Errorf("delete test video: %v", err)
		}
	})

	videoRepository := videos.NewRepository(db)
	if err := videoRepository.UpsertMany(context.Background(), []videos.Video{{
		ID: videoID, Title: "Liked track", Channel: "Liked channel", Duration: 77,
	}}); err != nil {
		t.Fatalf("seed video metadata: %v", err)
	}
	handler := liked.NewHandler(liked.NewRepository(db, videos.NewService(videoRepository)))
	sessions := auth.NewSessionStore(db)
	cookie := &http.Cookie{Name: auth.SessionCookieName, Value: fixture.Token}
	csrfCookie := &http.Cookie{Name: auth.CSRFCookieName, Value: fixture.CSRFToken}
	headers := make(http.Header)
	headers.Set(auth.CSRFHeaderName, fixture.CSRFToken)
	postHandler := sessions.Auth(sessions.CSRF(http.HandlerFunc(handler.HandlePost)))
	for range 2 {
		response := testutils.Request(t, postHandler, http.MethodPost, "/api/liked?video_id="+videoID, nil, headers, cookie, csrfCookie)
		if response.Code != http.StatusNoContent {
			t.Fatalf("add liked status = %d, want %d; body: %s", response.Code, http.StatusNoContent, response.Body.String())
		}
	}

	getHandler := sessions.Auth(http.HandlerFunc(handler.Handle))
	response := testutils.Request(t, getHandler, http.MethodGet, "/api/liked", nil, nil, cookie)
	if response.Code != http.StatusOK {
		t.Fatalf("list liked status = %d, want %d; body: %s", response.Code, http.StatusOK, response.Body.String())
	}
	var items []liked.GetVideosInfoResult
	if err := json.Unmarshal(response.Body.Bytes(), &items); err != nil {
		t.Fatalf("decode liked response: %v", err)
	}
	if len(items) != 1 || items[0].ID != videoID || items[0].Title != "Liked track" || items[0].Duration != 77 {
		t.Fatalf("liked items = %#v", items)
	}
}
