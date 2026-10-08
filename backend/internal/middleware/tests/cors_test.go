package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/middleware"
)

func TestCORSMiddlewareAddsHeadersAndForwardsRequest(t *testing.T) {
	called := false
	handler := middleware.CORSMiddleware(http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		called = true
		responseWriter.WriteHeader(http.StatusNoContent)
	}))
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/resource", nil))

	if !called {
		t.Fatal("next handler was not called")
	}
	if response.Code != http.StatusNoContent {
		t.Errorf("status = %d, want %d", response.Code, http.StatusNoContent)
	}
	if got := response.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:3000" {
		t.Errorf("Allow-Origin = %q", got)
	}
	if got := response.Header().Get("Access-Control-Allow-Credentials"); got != "true" {
		t.Errorf("Allow-Credentials = %q, want true", got)
	}
}

func TestCORSMiddlewareShortCircuitsPreflight(t *testing.T) {
	called := false
	handler := middleware.CORSMiddleware(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		called = true
	}))
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodOptions, "/resource", nil))

	if called {
		t.Fatal("next handler was called for preflight request")
	}
	if response.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", response.Code, http.StatusOK)
	}
	if got := response.Header().Get("Access-Control-Allow-Headers"); got == "" {
		t.Error("preflight response is missing allowed headers")
	}
}
