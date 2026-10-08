package health_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/health"
)

func TestHandleReportsServiceStatus(t *testing.T) {
	handler := health.NewHandler(nil)
	response := httptest.NewRecorder()
	handler.Handle(response, httptest.NewRequest(http.MethodGet, "/health", nil))

	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusOK)
	}
	if got := response.Header().Get("Content-Type"); got != "application/json" {
		t.Errorf("Content-Type = %q, want application/json", got)
	}
	var payload health.HealthResponse
	if err := json.Unmarshal(response.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload.Status != "OK" || payload.Version != health.Version {
		t.Errorf("status/version = %q/%q", payload.Status, payload.Version)
	}
	if payload.Services.Database != "disconnected" {
		t.Errorf("database status = %q, want disconnected", payload.Services.Database)
	}
	if payload.Services.Cache != "disconnected (not configured)" {
		t.Errorf("cache status = %q", payload.Services.Cache)
	}
	if payload.Timestamp.IsZero() || payload.Uptime == "" {
		t.Errorf("timestamp/uptime should be populated: %+v", payload)
	}
}
