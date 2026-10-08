package main

import (
	"net/http"
	"testing"

	"backend/internal/testutils"
)

func TestHTTPHandlerRegistersAPIEndpoints(t *testing.T) {
	testutils.InstallExecutable(t, "yt-dlp", `#!/bin/sh
case "$*" in
  *--dump-single-json*) printf '%s\n' '{"id":"playlist-fixture","title":"Fixture playlist"}' ;;
  *--playlist-start*) exit 0 ;;
  *) printf '%s\n' '{"id":"playlist-fixture","title":"Fixture playlist"}' ;;
esac
`)
	handler := newHTTPHandler(nil, "test")
	tests := []struct {
		name       string
		method     string
		target     string
		wantStatus int
	}{
		{name: "health", method: http.MethodGet, target: "/health", wantStatus: http.StatusOK},
		{name: "api health", method: http.MethodGet, target: "/api/health", wantStatus: http.StatusOK},
		{name: "playlist details", method: http.MethodGet, target: "/api/playlist-details?playlist_id=fixture", wantStatus: http.StatusOK},
		{name: "popular playlists", method: http.MethodGet, target: "/api/popular-playlists", wantStatus: http.StatusOK},
		{name: "playlist tracks", method: http.MethodGet, target: "/api/playlist-tracks?playlist_id=fixture", wantStatus: http.StatusOK},
		{name: "stream manifest", method: http.MethodGet, target: "/api/stream/manifest?v=abcdefghijk", wantStatus: http.StatusUnauthorized},
		{name: "search", method: http.MethodGet, target: "/api/search", wantStatus: http.StatusBadRequest},
		{name: "playback history", method: http.MethodGet, target: "/api/playback-history", wantStatus: http.StatusUnauthorized},
		{name: "register", method: http.MethodPost, target: "/api/auth/register", wantStatus: http.StatusBadRequest},
		{name: "login", method: http.MethodPost, target: "/api/auth/login", wantStatus: http.StatusBadRequest},
		{name: "logout", method: http.MethodPost, target: "/api/auth/logout", wantStatus: http.StatusUnauthorized},
		{name: "current user", method: http.MethodGet, target: "/api/auth/me", wantStatus: http.StatusUnauthorized},
		{name: "liked videos", method: http.MethodGet, target: "/api/liked", wantStatus: http.StatusUnauthorized},
		{name: "add liked video", method: http.MethodPost, target: "/api/liked", wantStatus: http.StatusUnauthorized},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			response := testutils.Request(t, handler, test.method, test.target, nil, nil)
			if response.Code != test.wantStatus {
				t.Fatalf("%s %s status = %d, want %d; body: %s", test.method, test.target, response.Code, test.wantStatus, response.Body.String())
			}
			if got := response.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:3000" {
				t.Errorf("CORS Allow-Origin = %q", got)
			}
		})
	}
}
