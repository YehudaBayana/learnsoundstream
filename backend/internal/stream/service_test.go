package stream

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestStreamManifestProxiesRangeRequests(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		if got := request.Header.Get("Range"); got != "bytes=10-19" {
			t.Errorf("upstream Range = %q, want %q", got, "bytes=10-19")
		}
		if got := request.Header.Get("If-Range"); got != `"media-etag"` {
			t.Errorf("upstream If-Range = %q, want %q", got, `"media-etag"`)
		}
		responseWriter.Header().Set("Accept-Ranges", "bytes")
		responseWriter.Header().Set("Content-Range", "bytes 10-19/100")
		responseWriter.Header().Set("Content-Length", "10")
		responseWriter.Header().Set("Content-Type", "audio/mp4")
		responseWriter.WriteHeader(http.StatusPartialContent)
		_, _ = io.WriteString(responseWriter, "0123456789")
	}))
	defer upstream.Close()

	service := &Service{}
	service.urlCache.Store("video-id", cachedURL{url: upstream.URL, expiresAt: time.Now().Add(time.Hour)})
	request := httptest.NewRequest(http.MethodGet, "/api/stream/manifest?v=video-id", nil)
	request.Header.Set("Range", "bytes=10-19")
	request.Header.Set("If-Range", `"media-etag"`)
	response := httptest.NewRecorder()

	service.StreamManifest(request, response, uuid.Nil, "video-id")

	if response.Code != http.StatusPartialContent {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusPartialContent)
	}
	if got := response.Header().Get("Content-Range"); got != "bytes 10-19/100" {
		t.Errorf("Content-Range = %q, want %q", got, "bytes 10-19/100")
	}
	if got := response.Header().Get("Accept-Ranges"); got != "bytes" {
		t.Errorf("Accept-Ranges = %q, want %q", got, "bytes")
	}
	if got := response.Header().Get("Content-Type"); got != "audio/mp4" {
		t.Errorf("Content-Type = %q, want %q", got, "audio/mp4")
	}
	if got := strings.TrimSpace(response.Body.String()); got != "0123456789" {
		t.Errorf("body = %q, want %q", got, "0123456789")
	}
}
