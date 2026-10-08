//go:build integration

package auth_test

import (
	"encoding/json"
	"net/http"
	"strings"
	"testing"

	"backend/internal/auth"
	"backend/internal/testutils"

	"github.com/google/uuid"
)

func TestRegistrationAndSessionLifecycle(t *testing.T) {
	db := testutils.OpenTestDB(t)
	driver := newIntegrationAuthDriver(db)
	email := "register-" + uuid.NewString() + "@example.test"
	cleanupUserByEmail(t, db, email)

	register := driver.register(t, email, "test-password")
	if register.Code != http.StatusCreated {
		t.Fatalf("register status = %d, want %d; body: %s", register.Code, http.StatusCreated, register.Body.String())
	}
	var registered struct {
		User struct {
			ID    string `json:"id"`
			Email string `json:"email"`
		} `json:"user"`
	}
	if err := json.Unmarshal(register.Body.Bytes(), &registered); err != nil {
		t.Fatalf("decode registration response: %v", err)
	}
	if registered.User.Email != email || registered.User.ID == "" {
		t.Fatalf("registered user = %+v, want email %q and a non-empty ID", registered.User, email)
	}

	var sessionCookie, csrfCookie *http.Cookie
	for _, cookie := range register.Result().Cookies() {
		switch cookie.Name {
		case auth.SessionCookieName:
			sessionCookie = cookie
		case auth.CSRFCookieName:
			csrfCookie = cookie
		}
	}
	if sessionCookie == nil || csrfCookie == nil {
		t.Fatalf("registration cookies missing: %#v", register.Result().Cookies())
	}

	profile := driver.request(t, http.MethodGet, "/api/auth/me", nil, nil, sessionCookie)
	if profile.Code != http.StatusOK {
		t.Fatalf("authenticated profile status = %d, want %d; body: %s", profile.Code, http.StatusOK, profile.Body.String())
	}

	logoutWithoutCSRF := driver.request(t, http.MethodPost, "/api/auth/logout", nil, nil, sessionCookie)
	if logoutWithoutCSRF.Code != http.StatusForbidden {
		t.Fatalf("logout without CSRF status = %d, want %d", logoutWithoutCSRF.Code, http.StatusForbidden)
	}

	headers := make(http.Header)
	headers.Set(auth.CSRFHeaderName, csrfCookie.Value)
	logout := driver.request(t, http.MethodPost, "/api/auth/logout", nil, headers, sessionCookie, csrfCookie)
	if logout.Code != http.StatusNoContent {
		t.Fatalf("logout status = %d, want %d; body: %s", logout.Code, http.StatusNoContent, logout.Body.String())
	}

	afterLogout := driver.request(t, http.MethodGet, "/api/auth/me", nil, nil, sessionCookie)
	if afterLogout.Code != http.StatusUnauthorized {
		t.Fatalf("profile after logout status = %d, want %d", afterLogout.Code, http.StatusUnauthorized)
	}

	login := driver.login(t, email, "test-password")
	if login.Code != http.StatusOK {
		t.Fatalf("login status = %d, want %d; body: %s", login.Code, http.StatusOK, login.Body.String())
	}
}

func TestSeededSessionAuthenticatesProfile(t *testing.T) {
	db := testutils.OpenTestDB(t)
	fixture := seedUser(t, db)
	driver := newIntegrationAuthDriver(db)
	sessionCookie := &http.Cookie{Name: auth.SessionCookieName, Value: fixture.Token}

	response := driver.request(t, http.MethodGet, "/api/auth/me", nil, nil, sessionCookie)
	if response.Code != http.StatusOK {
		t.Fatalf("profile status = %d, want %d; body: %s", response.Code, http.StatusOK, response.Body.String())
	}
	if !strings.Contains(response.Body.String(), fixture.Email) {
		t.Errorf("profile body %q does not contain fixture email %q", response.Body.String(), fixture.Email)
	}
}
