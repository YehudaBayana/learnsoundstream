//go:build integration

package health_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/health"
	"backend/internal/testutils"
)

func TestHandleReportsConnectedDatabase(t *testing.T) {
	db := testutils.OpenTestDB(t)
	response := httptest.NewRecorder()
	health.NewHandler(db).Handle(response, httptest.NewRequest(http.MethodGet, "/health", nil))

	var payload health.HealthResponse
	if err := json.Unmarshal(response.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode health response: %v", err)
	}
	if response.Code != http.StatusOK || payload.Services.Database != "connected" {
		t.Fatalf("health status = %d, database = %q", response.Code, payload.Services.Database)
	}
}
