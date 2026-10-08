package stream_test

import (
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"sync/atomic"
	"testing"

	"backend/internal/stream"
	"backend/internal/testutils"

	"github.com/google/uuid"
)

func TestStreamManifestProxiesRangeRequestsAndCachesResolvedURL(t *testing.T) {
	var upstreamRequests atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		upstreamRequests.Add(1)
		if got := request.Header.Get("Range"); got != "bytes=10-19" {
			t.Errorf("upstream Range = %q, want bytes=10-19", got)
		}
		if got := request.Header.Get("If-Range"); got != `"media-etag"` {
			t.Errorf("upstream If-Range = %q, want media etag", got)
		}
		responseWriter.Header().Set("Accept-Ranges", "bytes")
		responseWriter.Header().Set("Content-Range", "bytes 10-19/100")
		responseWriter.Header().Set("Content-Type", "audio/mp4")
		responseWriter.WriteHeader(http.StatusPartialContent)
		_, _ = io.WriteString(responseWriter, "0123456789")
	}))
	defer upstream.Close()

	resolveCalls := t.TempDir() + "/resolve-count"
	t.Setenv("STREAM_TEST_UPSTREAM", upstream.URL)
	t.Setenv("STREAM_TEST_RESOLVE_CALLS", resolveCalls)
	testutils.InstallExecutable(t, "yt-dlp", `#!/bin/sh
printf x >> "$STREAM_TEST_RESOLVE_CALLS"
printf '%s\n' "$STREAM_TEST_UPSTREAM"
`)
	service := stream.NewService(nil)

	for i := 0; i < 2; i++ {
		request := httptest.NewRequest(http.MethodGet, "/api/stream/manifest?v=video-id", nil)
		request.Header.Set("Range", "bytes=10-19")
		request.Header.Set("If-Range", `"media-etag"`)
		response := httptest.NewRecorder()
		service.StreamManifest(request, response, uuid.Nil, "video-id")

		if response.Code != http.StatusPartialContent {
			t.Fatalf("status = %d, want %d; body: %s", response.Code, http.StatusPartialContent, response.Body.String())
		}
		if got := response.Header().Get("Content-Range"); got != "bytes 10-19/100" {
			t.Errorf("Content-Range = %q", got)
		}
		if got := response.Header().Get("Accept-Ranges"); got != "bytes" {
			t.Errorf("Accept-Ranges = %q", got)
		}
		if got := response.Header().Get("Content-Type"); got != "audio/mp4" {
			t.Errorf("Content-Type = %q", got)
		}
		if got := strings.TrimSpace(response.Body.String()); got != "0123456789" {
			t.Errorf("body = %q", got)
		}
	}

	calls, err := os.ReadFile(resolveCalls)
	if err != nil {
		t.Fatalf("read resolver call count: %v", err)
	}
	if string(calls) != "x" {
		t.Errorf("resolver was called %d times, want once", len(calls))
	}
	if got := upstreamRequests.Load(); got != 2 {
		t.Errorf("upstream requests = %d, want 2", got)
	}
}

func TestStreamManifestSuppressesBodyForHead(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		responseWriter.Header().Set("Content-Type", "audio/mp4")
		responseWriter.WriteHeader(http.StatusOK)
		_, _ = io.WriteString(responseWriter, "audio-data")
	}))
	defer upstream.Close()
	t.Setenv("STREAM_TEST_UPSTREAM", upstream.URL)
	testutils.InstallExecutable(t, "yt-dlp", `#!/bin/sh
printf '%s\n' "$STREAM_TEST_UPSTREAM"
`)
	service := stream.NewService(nil)
	request := httptest.NewRequest(http.MethodHead, "/api/stream/manifest?v=video-id", nil)
	response := httptest.NewRecorder()
	service.StreamManifest(request, response, uuid.Nil, "video-id")
	if response.Code != http.StatusOK || response.Body.Len() != 0 {
		t.Errorf("HEAD response = status %d, body %q", response.Code, response.Body.String())
	}
}
