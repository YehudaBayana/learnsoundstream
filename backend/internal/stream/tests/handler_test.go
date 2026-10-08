package stream_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/stream"
)

func TestHandleManifestRejectsInvalidVideoIDs(t *testing.T) {
	tests := []struct {
		name  string
		query string
	}{
		{name: "missing video ID", query: "/api/stream/manifest"},
		{name: "short video ID", query: "/api/stream/manifest?v=short"},
		{name: "invalid characters", query: "/api/stream/manifest?v=bad_id!123"},
	}

	handler := stream.NewHandler(nil)
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			response := httptest.NewRecorder()
			handler.HandleManifest(response, httptest.NewRequest(http.MethodGet, test.query, nil))
			if response.Code != http.StatusBadRequest {
				t.Errorf("status = %d, want %d", response.Code, http.StatusBadRequest)
			}
		})
	}
}
