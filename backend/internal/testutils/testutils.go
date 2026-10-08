package testutils

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"

	"backend/internal/auth"
	"backend/internal/database"

	"github.com/google/uuid"
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

type AuthFixture struct {
	ID        uuid.UUID
	Email     string
	Password  string
	Token     string
	CSRFToken string
}

func SeedAuthUser(t *testing.T, pool *pgxpool.Pool) AuthFixture {
	t.Helper()

	fixture := AuthFixture{
		Email:    "test-" + uuid.NewString() + "@example.test",
		Password: "test-password",
	}
	passwordHash, err := auth.HashPassword(fixture.Password)
	if err != nil {
		t.Fatalf("hash fixture password: %v", err)
	}

	sessions := auth.NewSessionStore(pool)
	repository := auth.NewRepository(sessions, pool, false)
	fixture.ID, err = repository.CreateUser(context.Background(), fixture.Email, passwordHash)
	if err != nil {
		t.Fatalf("create fixture user: %v", err)
	}
	t.Cleanup(func() {
		if _, cleanupErr := pool.Exec(context.Background(), "DELETE FROM users WHERE id = $1", fixture.ID); cleanupErr != nil {
			t.Errorf("delete fixture user: %v", cleanupErr)
		}
	})

	fixture.Token, fixture.CSRFToken, _, err = sessions.Create(context.Background(), fixture.ID, "test-agent", "127.0.0.1")
	if err != nil {
		t.Fatalf("create fixture session: %v", err)
	}
	return fixture
}

func InstallExecutable(t *testing.T, name, script string) string {
	t.Helper()
	directory := t.TempDir()
	path := filepath.Join(directory, name)
	if err := os.WriteFile(path, []byte(script), 0o700); err != nil {
		t.Fatalf("write test executable: %v", err)
	}
	t.Setenv("PATH", directory+string(os.PathListSeparator)+os.Getenv("PATH"))
	return path
}

func envOrDefault(name, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}
