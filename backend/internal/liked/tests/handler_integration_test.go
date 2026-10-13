//go:build integration

package liked_test

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"

	"backend/internal/auth"
	"backend/internal/liked"
	"backend/internal/storage"
	"backend/internal/testutils"
	"backend/internal/videos"

	"github.com/google/uuid"
)

func seedVideo(t *testing.T, repository *videos.DatabaseRepository, ownerID uuid.UUID, title string) videos.Video {
	t.Helper()
	videoID := uuid.New()
	created, err := repository.Create(context.Background(), videos.NewVideo{
		ID:           videoID,
		OwnerID:      ownerID,
		Title:        title,
		OriginalName: title + ".mp4",
		OriginalKey:  ownerID.String() + "/" + videoID.String() + "/original.mp4",
	})
	if err != nil {
		t.Fatalf("seed video: %v", err)
	}
	return created
}

func TestAuthenticatedLikedEndpointsAreIdempotentAndReturnVideos(t *testing.T) {
	db := testutils.OpenTestDB(t)
	fixture := testutils.SeedAuthUser(t, db)
	store := storage.NewMemoryStorage()
	videoRepository := videos.NewRepository(db)
	likedVideo := seedVideo(t, videoRepository, fixture.ID, "Liked dance")

	handler := liked.NewHandler(liked.NewRepository(db, videos.NewService(videoRepository, store, videos.Settings{})))
	sessions := auth.NewSessionStore(db)
	cookie := &http.Cookie{Name: auth.SessionCookieName, Value: fixture.Token}
	csrfCookie := &http.Cookie{Name: auth.CSRFCookieName, Value: fixture.CSRFToken}
	headers := make(http.Header)
	headers.Set(auth.CSRFHeaderName, fixture.CSRFToken)
	postHandler := sessions.Auth(sessions.CSRF(http.HandlerFunc(handler.HandlePost)))

	for range 2 {
		response := testutils.Request(t, postHandler, http.MethodPost, "/api/liked?video_id="+likedVideo.ID.String(), nil, headers, cookie, csrfCookie)
		if response.Code != http.StatusNoContent {
			t.Fatalf("add liked status = %d, want %d; body: %s", response.Code, http.StatusNoContent, response.Body.String())
		}
	}

	getHandler := sessions.Auth(http.HandlerFunc(handler.Handle))
	response := testutils.Request(t, getHandler, http.MethodGet, "/api/liked", nil, nil, cookie)
	if response.Code != http.StatusOK {
		t.Fatalf("list liked status = %d, want %d; body: %s", response.Code, http.StatusOK, response.Body.String())
	}
	var items []videos.Video
	if err := json.Unmarshal(response.Body.Bytes(), &items); err != nil {
		t.Fatalf("decode liked response: %v", err)
	}
	if len(items) != 1 || items[0].ID != likedVideo.ID || items[0].Title != "Liked dance" {
		t.Fatalf("liked items = %+v", items)
	}
}

func TestLikingAnotherUsersVideoReturnsNotFound(t *testing.T) {
	db := testutils.OpenTestDB(t)
	owner := testutils.SeedAuthUser(t, db)
	stranger := testutils.SeedAuthUser(t, db)
	store := storage.NewMemoryStorage()
	videoRepository := videos.NewRepository(db)
	privateVideo := seedVideo(t, videoRepository, owner.ID, "Private dance")

	handler := liked.NewHandler(liked.NewRepository(db, videos.NewService(videoRepository, store, videos.Settings{})))
	sessions := auth.NewSessionStore(db)
	headers := make(http.Header)
	headers.Set(auth.CSRFHeaderName, stranger.CSRFToken)
	postHandler := sessions.Auth(sessions.CSRF(http.HandlerFunc(handler.HandlePost)))

	response := testutils.Request(t, postHandler, http.MethodPost, "/api/liked?video_id="+privateVideo.ID.String(), nil, headers,
		&http.Cookie{Name: auth.SessionCookieName, Value: stranger.Token},
		&http.Cookie{Name: auth.CSRFCookieName, Value: stranger.CSRFToken},
	)
	if response.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusNotFound)
	}
}
