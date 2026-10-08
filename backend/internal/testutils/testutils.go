package testutils

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"backend/internal/database"

	"github.com/jackc/pgx/v5/pgxpool"
)

func DatabaseURL() string {
	if url := os.Getenv("TEST_DATABASE_URL"); url != "" {
		return url
	}
	if url := os.Getenv("DB_URL"); url != "" {
		return url
	}

	host := envOrDefault("DB_HOST", "127.0.0.1")
	port := envOrDefault("DB_PORT", "5432")
	user := envOrDefault("DB_USER", "postgres")
	password := envOrDefault("DB_PASSWORD", "postgres")
	databaseName := envOrDefault("DB_NAME", "soundstream")
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, password, host, port, databaseName)
}

func OpenTestDB(t *testing.T) *pgxpool.Pool {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pool, err := database.InitDB(ctx, DatabaseURL())
	if err != nil {
		t.Fatalf("connect to integration-test database: %v", err)
	}
	t.Cleanup(pool.Close)
	return pool
}

func Request(t *testing.T, handler http.Handler, method, target string, body io.Reader, headers http.Header, cookies ...*http.Cookie) *httptest.ResponseRecorder {
	t.Helper()
	request := httptest.NewRequest(method, target, body)
	for name, values := range headers {
		for _, value := range values {
			request.Header.Add(name, value)
		}
	}
	for _, cookie := range cookies {
		request.AddCookie(cookie)
	}
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	return response
}

func envOrDefault(name, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}
