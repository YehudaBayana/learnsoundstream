package auth_test

import (
	"context"
	"testing"

	"backend/internal/testutils"

	"github.com/jackc/pgx/v5/pgxpool"
)

type userFixture = testutils.AuthFixture

func seedUser(t *testing.T, db *pgxpool.Pool) userFixture {
	t.Helper()
	return testutils.SeedAuthUser(t, db)
}

func cleanupUserByEmail(t *testing.T, db *pgxpool.Pool, email string) {
	t.Helper()
	t.Cleanup(func() {
		if _, err := db.Exec(context.Background(), "DELETE FROM users WHERE email = $1", email); err != nil {
			t.Errorf("delete test user %q: %v", email, err)
		}
	})
}
