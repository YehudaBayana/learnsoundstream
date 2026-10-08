package auth_test

import (
	"net/http"
	"strings"
	"testing"
)

func TestRegisterRejectsInvalidInput(t *testing.T) {
	tests := []struct {
		name       string
		body       string
		wantStatus int
		wantCode   string
	}{
		{name: "malformed JSON", body: `{"email":`, wantStatus: http.StatusBadRequest, wantCode: "invalid_request"},
		{name: "invalid email", body: `{"email":"not-an-email","password":"valid-password"}`, wantStatus: http.StatusUnprocessableEntity, wantCode: "invalid_email"},
		{name: "short password", body: `{"email":"person@example.test","password":"abc"}`, wantStatus: http.StatusUnprocessableEntity, wantCode: "weak_password"},
		{name: "long password", body: `{"email":"person@example.test","password":"123456789012345678901234567890123456789012345678901"}`, wantStatus: http.StatusUnprocessableEntity, wantCode: "weak_password"},
	}

	driver := newUnitAuthDriver()
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			response := driver.request(t, http.MethodPost, "/api/auth/register", strings.NewReader(test.body), nil)

			if response.Code != test.wantStatus {
				t.Fatalf("status = %d, want %d; body: %s", response.Code, test.wantStatus, response.Body.String())
			}
			if !strings.Contains(response.Body.String(), `"code":"`+test.wantCode+`"`) {
				t.Errorf("response body %q does not contain error code %q", response.Body.String(), test.wantCode)
			}
		})
	}
}
