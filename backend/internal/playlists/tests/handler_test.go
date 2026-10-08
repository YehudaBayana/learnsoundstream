package playlists_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/playlists"
)

func TestDetailsAndTracksRequirePlaylistID(t *testing.T) {
	handler := playlists.NewHandler(nil)
	tests := []struct {
		name string
		call func(http.ResponseWriter, *http.Request)
	}{
		{name: "details", call: handler.HandleDetails},
		{name: "tracks", call: handler.HandleTracks},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			response := httptest.NewRecorder()
			test.call(response, httptest.NewRequest(http.MethodGet, "/api/playlist", nil))
			if response.Code != http.StatusBadRequest {
				t.Errorf("status = %d, want %d", response.Code, http.StatusBadRequest)
			}
		})
	}
}
