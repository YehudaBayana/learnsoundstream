//go:build integration

package videos_test

import (
	"bytes"
	"context"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"backend/internal/auth"
	"backend/internal/storage"
	"backend/internal/testutils"
	"backend/internal/videos"

	"github.com/google/uuid"
)

const playbackPayload = "0123456789abcdefghij"

type handlerFixture struct {
	handler    http.Handler
	repository *videos.DatabaseRepository
	store      *storage.LocalStorage
	owner      testutils.AuthFixture
	stranger   testutils.AuthFixture
}

func newHandlerFixture(t *testing.T) handlerFixture {
	t.Helper()
	db := testutils.OpenTestDB(t)
	store, err := storage.NewLocalStorage(t.TempDir())
	if err != nil {
		t.Fatalf("NewLocalStorage() error = %v", err)
	}
	repository := videos.NewRepository(db)
	service := videos.NewService(repository, store)
	videoHandler := videos.NewHandler(service, videos.NewProcessor(service, store), 1<<20)
	sessions := auth.NewSessionStore(db)
	protected := func(handler http.HandlerFunc) http.Handler { return sessions.Auth(sessions.CSRF(handler)) }

	mux := http.NewServeMux()
	mux.Handle("POST /api/videos", protected(videoHandler.HandleCreate))
	mux.Handle("GET /api/videos/{id}", protected(videoHandler.HandleGet))
	mux.Handle("PATCH /api/videos/{id}", protected(videoHandler.HandleUpdate))
	mux.Handle("DELETE /api/videos/{id}", protected(videoHandler.HandleDelete))
	mux.Handle("GET /api/videos/{id}/stream", protected(videoHandler.HandleStream))
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

// seedReadyVideo stores playback and thumbnail files and inserts a ready row for the owner.
func (fixture handlerFixture) seedReadyVideo(t *testing.T) videos.Video {
	t.Helper()
	ctx := context.Background()
	newVideo := videos.NewVideo{
		ID:           uuid.New(),
		OwnerID:      fixture.owner.ID,
		Title:        "Ready dance",
		OriginalName: "ready.mp4",
	}
	prefix := fixture.owner.ID.String() + "/" + newVideo.ID.String() + "/"
	newVideo.OriginalKey = prefix + "original.mp4"
	for key, content := range map[string]string{
		newVideo.OriginalKey:    "original",
		prefix + "playback.mp4": playbackPayload,
		prefix + "thumb.jpg":    "jpeg",
	} {
		if _, err := fixture.store.Put(ctx, key, strings.NewReader(content)); err != nil {
			t.Fatalf("Put(%q) error = %v", key, err)
		}
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

func TestStreamServesByteRanges(t *testing.T) {
	fixture := newHandlerFixture(t)
	video := fixture.seedReadyVideo(t)
	target := "/api/videos/" + video.ID.String() + "/stream"

	response := fixture.request(t, fixture.owner, http.MethodGet, target, nil, map[string]string{"Range": "bytes=5-9"})
	if response.Code != http.StatusPartialContent {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusPartialContent)
	}
	if got := response.Body.String(); got != "56789" {
		t.Errorf("body = %q, want %q", got, "56789")
	}
	if got := response.Header().Get("Content-Range"); got != "bytes 5-9/20" {
		t.Errorf("Content-Range = %q, want %q", got, "bytes 5-9/20")
	}

	full := fixture.request(t, fixture.owner, http.MethodGet, target, nil, nil)
	if full.Code != http.StatusOK || full.Body.String() != playbackPayload {
		t.Errorf("full stream = %d %q", full.Code, full.Body.String())
	}
	if got := full.Header().Get("Accept-Ranges"); got != "bytes" {
		t.Errorf("Accept-Ranges = %q, want bytes", got)
	}
}

func TestOtherUsersGetNotFoundForPrivateVideos(t *testing.T) {
	fixture := newHandlerFixture(t)
	video := fixture.seedReadyVideo(t)
	base := "/api/videos/" + video.ID.String()

	for _, test := range []struct{ name, method, target string }{
		{"get", http.MethodGet, base},
		{"stream", http.MethodGet, base + "/stream"},
		{"thumbnail", http.MethodGet, base + "/thumbnail"},
		{"update", http.MethodPatch, base},
		{"delete", http.MethodDelete, base},
	} {
		t.Run(test.name, func(t *testing.T) {
			response := fixture.request(t, fixture.stranger, test.method, test.target, []byte(`{"title":"x"}`), nil)
			if response.Code != http.StatusNotFound {
				t.Errorf("status = %d, want %d", response.Code, http.StatusNotFound)
			}
		})
	}
}

func TestStreamRejectsVideosThatAreNotReady(t *testing.T) {
	fixture := newHandlerFixture(t)
	processing, err := fixture.repository.Create(context.Background(), newTestVideo(fixture.owner.ID, "Still processing"))
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	response := fixture.request(t, fixture.owner, http.MethodGet, "/api/videos/"+processing.ID.String()+"/stream", nil, nil)
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
		if _, err := fixture.store.Stat(context.Background(), key); err == nil {
			t.Errorf("file %q still exists after delete", key)
		}
	}
}

func TestCreateRejectsNonVideoUploads(t *testing.T) {
	fixture := newHandlerFixture(t)

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	part, err := writer.CreateFormFile("file", "notes.txt")
	if err != nil {
		t.Fatalf("create form file: %v", err)
	}
	_, _ = part.Write([]byte("not a video"))
	_ = writer.Close()

	response := fixture.request(t, fixture.owner, http.MethodPost, "/api/videos", body.Bytes(), map[string]string{"Content-Type": writer.FormDataContentType()})
	if response.Code != http.StatusUnsupportedMediaType {
		t.Errorf("status = %d, want %d; body: %s", response.Code, http.StatusUnsupportedMediaType, response.Body.String())
	}

	notMultipart := fixture.request(t, fixture.owner, http.MethodPost, "/api/videos", []byte(`{}`), map[string]string{"Content-Type": "application/json"})
	if notMultipart.Code != http.StatusUnsupportedMediaType {
		t.Errorf("JSON body status = %d, want %d", notMultipart.Code, http.StatusUnsupportedMediaType)
	}
}
