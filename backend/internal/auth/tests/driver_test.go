package auth_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/auth"
	"backend/internal/testutils"

	"github.com/jackc/pgx/v5/pgxpool"
)

type authDriver struct {
	handler http.Handler
}

func newUnitAuthDriver() *authDriver {
	authHandler := auth.NewHandler(nil)
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/auth/register", authHandler.HandleRegister)
	return &authDriver{handler: mux}
}

func newIntegrationAuthDriver(db *pgxpool.Pool) *authDriver {
	sessions := auth.NewSessionStore(db)
	repository := auth.NewRepository(sessions, db, false)
	authHandler := auth.NewHandler(repository)
	protected := func(next http.HandlerFunc) http.Handler {
		return sessions.Auth(sessions.CSRF(next))
	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/auth/register", authHandler.HandleRegister)
	mux.HandleFunc("POST /api/auth/login", authHandler.HandleLogin)
	mux.Handle("POST /api/auth/logout", protected(authHandler.HandleLogout))
	mux.Handle("GET /api/auth/me", sessions.Auth(http.HandlerFunc(authHandler.HandleMe)))
	return &authDriver{handler: mux}
}

func (driver *authDriver) request(
	t *testing.T,
	method, target string,
	body io.Reader,
	headers http.Header,
	cookies ...*http.Cookie,
) *httptest.ResponseRecorder {
	t.Helper()
	return testutils.Request(t, driver.handler, method, target, body, headers, cookies...)
}

func (driver *authDriver) register(t *testing.T, email, password string) *httptest.ResponseRecorder {
	t.Helper()
	return driver.sendCredentials(t, http.MethodPost, "/api/auth/register", email, password)
}

func (driver *authDriver) login(t *testing.T, email, password string) *httptest.ResponseRecorder {
	t.Helper()
	return driver.sendCredentials(t, http.MethodPost, "/api/auth/login", email, password)
}

func (driver *authDriver) sendCredentials(
	t *testing.T,
	method, target, email, password string,
) *httptest.ResponseRecorder {
	t.Helper()
	body, err := json.Marshal(struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}{Email: email, Password: password})
	if err != nil {
		t.Fatalf("encode credentials: %v", err)
	}
	return driver.request(t, method, target, bytes.NewReader(body), nil)
}
