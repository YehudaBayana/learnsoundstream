package search_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"backend/internal/search"
)

func TestHandleRejectsInvalidQueries(t *testing.T) {
	tests := []struct {
		name  string
		query string
	}{
		{name: "missing query", query: "/api/search"},
		{name: "whitespace query", query: "/api/search?q=%20%20"},
		{name: "query too long", query: "/api/search?q=" + strings.Repeat("x", 201)},
	}

	handler := search.NewHandler(nil)
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			response := httptest.NewRecorder()
			handler.Handle(response, httptest.NewRequest(http.MethodGet, test.query, nil))
			if response.Code != http.StatusBadRequest {
				t.Errorf("status = %d, want %d", response.Code, http.StatusBadRequest)
			}
		})
	}
}
