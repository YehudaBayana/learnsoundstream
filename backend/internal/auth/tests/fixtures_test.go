package auth_test

import (
	"context"
	"testing"

	"backend/internal/auth"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type userFixture struct {
	ID        uuid.UUID
	Email     string
	Password  string
	Token     string
	CSRFToken string
}

func seedUser(t *testing.T, db *pgxpool.Pool) userFixture {
	t.Helper()

	fixture := userFixture{
		Email:    "test-" + uuid.NewString() + "@example.test",
		Password: "test-password",
	}
	passwordHash, err := auth.HashPassword(fixture.Password)
	if err != nil {
		t.Fatalf("hash fixture password: %v", err)
	}

	sessions := auth.NewSessionStore(db)
	repository := auth.NewRepository(sessions, db, false)
	fixture.ID, err = repository.CreateUser(context.Background(), fixture.Email, passwordHash)
	if err != nil {
		t.Fatalf("create fixture user: %v", err)
	}
	t.Cleanup(func() {
		if _, cleanupErr := db.Exec(context.Background(), "DELETE FROM users WHERE id = $1", fixture.ID); cleanupErr != nil {
			t.Errorf("delete fixture user: %v", cleanupErr)
		}
	})

	fixture.Token, fixture.CSRFToken, _, err = sessions.Create(context.Background(), fixture.ID, "test-agent", "127.0.0.1")
	if err != nil {
		t.Fatalf("create fixture session: %v", err)
	}
	return fixture
}

func cleanupUserByEmail(t *testing.T, db *pgxpool.Pool, email string) {
	t.Helper()
	t.Cleanup(func() {
		if _, err := db.Exec(context.Background(), "DELETE FROM users WHERE email = $1", email); err != nil {
			t.Errorf("delete test user %q: %v", email, err)
		}
	})
}
