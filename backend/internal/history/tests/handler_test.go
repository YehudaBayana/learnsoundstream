package history_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/history"
)

func TestHandleRejectsInvalidPagination(t *testing.T) {
	tests := []struct {
		name  string
		query string
	}{
		{name: "non-numeric limit", query: "?limit=abc"},
		{name: "zero limit", query: "?limit=0"},
		{name: "negative offset", query: "?offset=-1"},
		{name: "non-numeric offset", query: "?offset=abc"},
	}

	handler := history.NewHandler(nil)
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			response := httptest.NewRecorder()
			handler.Handle(response, httptest.NewRequest(http.MethodGet, "/api/history"+test.query, nil))
			if response.Code != http.StatusBadRequest {
				t.Errorf("status = %d, want %d", response.Code, http.StatusBadRequest)
			}
		})
	}
}
