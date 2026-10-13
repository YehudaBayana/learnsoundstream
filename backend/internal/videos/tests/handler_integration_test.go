//go:build integration

package videos_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"backend/internal/auth"
	"backend/internal/storage"
	"backend/internal/testutils"
	"backend/internal/videos"
)

type handlerFixture struct {
	handler    http.Handler
	repository *videos.DatabaseRepository
	store      *storage.MemoryStorage
	owner      testutils.AuthFixture
	stranger   testutils.AuthFixture
}

func newHandlerFixture(t *testing.T) handlerFixture {
	t.Helper()
	db := testutils.OpenTestDB(t)
	store := storage.NewMemoryStorage()
	repository := videos.NewRepository(db)
	service := videos.NewService(repository, store, testSettings)
	videoHandler := videos.NewHandler(service, videos.NewProcessor(service, store))
	sessions := auth.NewSessionStore(db)
	protected := func(handler http.HandlerFunc) http.Handler { return sessions.Auth(sessions.CSRF(handler)) }

	mux := http.NewServeMux()
	mux.Handle("POST /api/videos/uploads", protected(videoHandler.HandleInitUpload))
	mux.Handle("POST /api/videos/{id}/uploads/parts", protected(videoHandler.HandlePresignParts))
	mux.Handle("POST /api/videos/{id}/uploads/complete", protected(videoHandler.HandleCompleteUpload))
	mux.Handle("GET /api/videos/{id}", protected(videoHandler.HandleGet))
	mux.Handle("PATCH /api/videos/{id}", protected(videoHandler.HandleUpdate))
	mux.Handle("DELETE /api/videos/{id}", protected(videoHandler.HandleDelete))
	mux.Handle("GET /api/videos/{id}/playback-url", protected(videoHandler.HandlePlaybackURL))
	mux.Handle("GET /api/videos/{id}/thumbnail", protected(videoHandler.HandleThumbnail))

	return handlerFixture{
		handler:    mux,
		repository: repository,
		store:      store,
		owner:      testutils.SeedAuthUser(t, db),
		stranger:   testutils.SeedAuthUser(t, db),
	}
}

func (fixture handlerFixture) request(t *testing.T, user testutils.AuthFixture, method, target string, body []byte, extraHeaders map[string]string) *httptest.ResponseRecorder {
	t.Helper()
	headers := make(http.Header)
	headers.Set(auth.CSRFHeaderName, user.CSRFToken)
	for name, value := range extraHeaders {
		headers.Set(name, value)
	}
	return testutils.Request(t, fixture.handler, method, target, bytes.NewReader(body), headers,
		&http.Cookie{Name: auth.SessionCookieName, Value: user.Token},
		&http.Cookie{Name: auth.CSRFCookieName, Value: user.CSRFToken},
	)
}

// seedReadyVideo stores playback and thumbnail objects and inserts a ready row for the owner.
func (fixture handlerFixture) seedReadyVideo(t *testing.T) videos.Video {
	t.Helper()
	ctx := context.Background()
	newVideo := newTestVideo(fixture.owner.ID, "Ready dance")
	prefix := fixture.owner.ID.String() + "/" + newVideo.ID.String() + "/"
	for _, key := range []string{newVideo.OriginalKey, prefix + "playback.mp4", prefix + "thumb.jpg"} {
		fixture.store.PutObject(key, []byte("data"))
	}
	created, err := fixture.repository.Create(ctx, newVideo)
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	if err := fixture.repository.MarkReady(ctx, created.OwnerID, created.ID, videos.ProcessingResult{
		PlaybackKey: prefix + "playback.mp4", ThumbnailKey: prefix + "thumb.jpg", MimeType: "video/mp4",
	}); err != nil {
		t.Fatalf("MarkReady() error = %v", err)
	}
	ready, err := fixture.repository.GetByID(ctx, created.OwnerID, created.ID)
	if err != nil {
		t.Fatalf("GetByID() error = %v", err)
	}
	return ready
}

func TestPlaybackURLReturnsSignedURLForOwner(t *testing.T) {
	fixture := newHandlerFixture(t)
	video := fixture.seedReadyVideo(t)

	response := fixture.request(t, fixture.owner, http.MethodGet, "/api/videos/"+video.ID.String()+"/playback-url", nil, nil)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body: %s", response.Code, http.StatusOK, response.Body.String())
	}
	var signed videos.SignedURL
	if err := json.Unmarshal(response.Body.Bytes(), &signed); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if !strings.HasSuffix(signed.URL, video.PlaybackKey) || !signed.ExpiresAt.After(time.Now()) {
		t.Errorf("signed = %+v, want a URL for %q that has not expired", signed, video.PlaybackKey)
	}
}

func TestThumbnailRedirectsToSignedURL(t *testing.T) {
	fixture := newHandlerFixture(t)
	video := fixture.seedReadyVideo(t)

	response := fixture.request(t, fixture.owner, http.MethodGet, "/api/videos/"+video.ID.String()+"/thumbnail", nil, nil)
	if response.Code != http.StatusFound {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusFound)
	}
	if got := response.Header().Get("Location"); !strings.HasSuffix(got, video.ThumbnailKey) {
		t.Errorf("Location = %q, want a URL for %q", got, video.ThumbnailKey)
	}
}

func TestOtherUsersGetNotFoundForPrivateVideos(t *testing.T) {
	fixture := newHandlerFixture(t)
	video := fixture.seedReadyVideo(t)
	base := "/api/videos/" + video.ID.String()

	for _, test := range []struct{ name, method, target string }{
		{"get", http.MethodGet, base},
		{"playback url", http.MethodGet, base + "/playback-url"},
		{"thumbnail", http.MethodGet, base + "/thumbnail"},
		{"update", http.MethodPatch, base},
		{"delete", http.MethodDelete, base},
		{"presign parts", http.MethodPost, base + "/uploads/parts"},
		{"complete upload", http.MethodPost, base + "/uploads/complete"},
	} {
		t.Run(test.name, func(t *testing.T) {
			response := fixture.request(t, fixture.stranger, test.method, test.target, []byte(`{"title":"x"}`), nil)
			if response.Code != http.StatusNotFound {
				t.Errorf("status = %d, want %d", response.Code, http.StatusNotFound)
			}
		})
	}
}

func TestPlaybackURLRejectsVideosThatAreNotReady(t *testing.T) {
	fixture := newHandlerFixture(t)
	processing, err := fixture.repository.Create(context.Background(), newTestVideo(fixture.owner.ID, "Still processing"))
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	response := fixture.request(t, fixture.owner, http.MethodGet, "/api/videos/"+processing.ID.String()+"/playback-url", nil, nil)
	if response.Code != http.StatusConflict {
		t.Errorf("status = %d, want %d", response.Code, http.StatusConflict)
	}
}

func TestUpdateChangesOnlyProvidedFieldsAndReturnsVideo(t *testing.T) {
	fixture := newHandlerFixture(t)
	video := fixture.seedReadyVideo(t)

	response := fixture.request(t, fixture.owner, http.MethodPatch, "/api/videos/"+video.ID.String(), []byte(`{"notes":"better frame"}`), nil)
	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body: %s", response.Code, http.StatusOK, response.Body.String())
	}
	var updated videos.Video
	if err := json.Unmarshal(response.Body.Bytes(), &updated); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if updated.Title != "Ready dance" || updated.Notes != "better frame" {
		t.Errorf("updated = %+v, want title kept and notes changed", updated)
	}

	empty := fixture.request(t, fixture.owner, http.MethodPatch, "/api/videos/"+video.ID.String(), []byte(`{"title":"  "}`), nil)
	if empty.Code != http.StatusBadRequest {
		t.Errorf("empty title status = %d, want %d", empty.Code, http.StatusBadRequest)
	}
}

func TestDeleteRemovesRowAndFiles(t *testing.T) {
	fixture := newHandlerFixture(t)
	video := fixture.seedReadyVideo(t)

	response := fixture.request(t, fixture.owner, http.MethodDelete, "/api/videos/"+video.ID.String(), nil, nil)
	if response.Code != http.StatusNoContent {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusNoContent)
	}
	if _, err := fixture.repository.GetByID(context.Background(), video.OwnerID, video.ID); err == nil {
		t.Error("video row still exists after delete")
	}
	for _, key := range []string{video.OriginalKey, video.PlaybackKey, video.ThumbnailKey} {
		if fixture.store.HasObject(key) {
			t.Errorf("object %q still exists after delete", key)
		}
	}
}

func TestInitUploadRejectsNonVideoFiles(t *testing.T) {
	fixture := newHandlerFixture(t)

	response := fixture.request(t, fixture.owner, http.MethodPost, "/api/videos/uploads", []byte(`{"filename":"notes.txt","size_bytes":10}`), nil)
	if response.Code != http.StatusUnsupportedMediaType {
		t.Errorf("status = %d, want %d; body: %s", response.Code, http.StatusUnsupportedMediaType, response.Body.String())
	}
	if fixture.store.OpenUploads() != 0 {
		t.Error("rejected file opened a multipart upload")
	}

	malformed := fixture.request(t, fixture.owner, http.MethodPost, "/api/videos/uploads", []byte(`not json`), nil)
	if malformed.Code != http.StatusBadRequest {
		t.Errorf("malformed body status = %d, want %d", malformed.Code, http.StatusBadRequest)
	}
}

func TestDirectUploadFlowEndsInProcessing(t *testing.T) {
	fixture := newHandlerFixture(t)

	initResponse := fixture.request(t, fixture.owner, http.MethodPost, "/api/videos/uploads", []byte(`{"filename":"spin.mov","size_bytes":5,"title":"Spin"}`), nil)
	if initResponse.Code != http.StatusCreated {
		t.Fatalf("init status = %d, want %d; body: %s", initResponse.Code, http.StatusCreated, initResponse.Body.String())
	}
	var session videos.UploadSession
	if err := json.Unmarshal(initResponse.Body.Bytes(), &session); err != nil {
		t.Fatalf("decode session: %v", err)
	}
	if session.Video.Status != videos.StatusUploading || session.PartCount != 1 {
		t.Fatalf("session = %+v, want an uploading video with one part", session)
	}
	base := "/api/videos/" + session.Video.ID.String() + "/uploads"

	partsResponse := fixture.request(t, fixture.owner, http.MethodPost, base+"/parts", []byte(`{"part_numbers":[1]}`), nil)
	if partsResponse.Code != http.StatusOK {
		t.Fatalf("parts status = %d, want %d; body: %s", partsResponse.Code, http.StatusOK, partsResponse.Body.String())
	}

	stored, err := fixture.repository.GetByID(context.Background(), fixture.owner.ID, session.Video.ID)
	if err != nil {
		t.Fatalf("GetByID() error = %v", err)
	}
	fixture.store.PutPart(stored.UploadID, 1, []byte("hello"))

	completeResponse := fixture.request(t, fixture.owner, http.MethodPost, base+"/complete", []byte(`{"parts":[{"part_number":1,"etag":"etag-1"}]}`), nil)
	if completeResponse.Code != http.StatusOK {
		t.Fatalf("complete status = %d, want %d; body: %s", completeResponse.Code, http.StatusOK, completeResponse.Body.String())
	}
	finished, err := fixture.repository.GetByID(context.Background(), fixture.owner.ID, session.Video.ID)
	if err != nil {
		t.Fatalf("GetByID() error = %v", err)
	}
	if finished.Status != videos.StatusProcessing || finished.UploadID != "" || !fixture.store.HasObject(finished.OriginalKey) {
		t.Errorf("finished = %+v, want a processing video whose original is stored", finished)
	}

	again := fixture.request(t, fixture.owner, http.MethodPost, base+"/complete", []byte(`{"parts":[{"part_number":1,"etag":"etag-1"}]}`), nil)
	if again.Code != http.StatusBadRequest {
		t.Errorf("repeated complete status = %d, want %d", again.Code, http.StatusBadRequest)
	}
}

func TestDeleteAbortsAnUnfinishedUpload(t *testing.T) {
	fixture := newHandlerFixture(t)
	initResponse := fixture.request(t, fixture.owner, http.MethodPost, "/api/videos/uploads", []byte(`{"filename":"spin.mp4","size_bytes":5}`), nil)
	var session videos.UploadSession
	if err := json.Unmarshal(initResponse.Body.Bytes(), &session); err != nil {
		t.Fatalf("decode session: %v", err)
	}

	response := fixture.request(t, fixture.owner, http.MethodDelete, "/api/videos/"+session.Video.ID.String(), nil, nil)
	if response.Code != http.StatusNoContent {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusNoContent)
	}
	if fixture.store.OpenUploads() != 0 {
		t.Error("multipart upload still open after delete")
	}
}
