package liked_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/liked"
)

func TestHandleRejectsInvalidPagination(t *testing.T) {
	tests := []struct {
		name  string
		query string
	}{
		{name: "non-numeric limit", query: "?limit=abc"},
		{name: "zero limit", query: "?limit=0"},
		{name: "negative offset", query: "?offset=-1"},
	}

	handler := liked.NewHandler(nil)
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			response := httptest.NewRecorder()
			handler.Handle(response, httptest.NewRequest(http.MethodGet, "/api/liked"+test.query, nil))
			if response.Code != http.StatusBadRequest {
				t.Errorf("status = %d, want %d", response.Code, http.StatusBadRequest)
			}
		})
	}
}

func TestHandlePostRequiresVideoID(t *testing.T) {
	handler := liked.NewHandler(nil)
	response := httptest.NewRecorder()
	handler.HandlePost(response, httptest.NewRequest(http.MethodPost, "/api/liked", nil))
	if response.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusBadRequest)
	}
}
