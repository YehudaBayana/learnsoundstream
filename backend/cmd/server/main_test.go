package main

import (
	"net/http"
	"testing"

	"backend/internal/config"
	"backend/internal/testutils"
)

func TestHTTPHandlerRegistersAPIEndpoints(t *testing.T) {
	handler, _, err := newHTTPHandler(nil, "test", config.Config{R2AccountID: "account", R2AccessKeyID: "key", R2SecretAccessKey: "secret", R2Bucket: "bucket", MaxUploadBytes: 1 << 20})
	if err != nil {
		t.Fatalf("newHTTPHandler() error = %v", err)
	}
	tests := []struct {
		name       string
		method     string
		target     string
		wantStatus int
	}{
		{name: "health", method: http.MethodGet, target: "/health", wantStatus: http.StatusOK},
		{name: "api health", method: http.MethodGet, target: "/api/health", wantStatus: http.StatusOK},
		{name: "register", method: http.MethodPost, target: "/api/auth/register", wantStatus: http.StatusBadRequest},
		{name: "login", method: http.MethodPost, target: "/api/auth/login", wantStatus: http.StatusBadRequest},
		{name: "logout", method: http.MethodPost, target: "/api/auth/logout", wantStatus: http.StatusUnauthorized},
		{name: "current user", method: http.MethodGet, target: "/api/auth/me", wantStatus: http.StatusUnauthorized},
		{name: "liked videos", method: http.MethodGet, target: "/api/liked", wantStatus: http.StatusUnauthorized},
		{name: "add liked video", method: http.MethodPost, target: "/api/liked", wantStatus: http.StatusUnauthorized},
		{name: "list videos", method: http.MethodGet, target: "/api/videos", wantStatus: http.StatusUnauthorized},
		{name: "init upload", method: http.MethodPost, target: "/api/videos/uploads", wantStatus: http.StatusUnauthorized},
		{name: "get video", method: http.MethodGet, target: "/api/videos/123e4567-e89b-12d3-a456-426614174000", wantStatus: http.StatusUnauthorized},
		{name: "playback url", method: http.MethodGet, target: "/api/videos/123e4567-e89b-12d3-a456-426614174000/playback-url", wantStatus: http.StatusUnauthorized},
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
