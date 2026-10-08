//go:build integration

package database_test

import (
	"context"
	"testing"

	"backend/internal/testutils"
)

func TestDatabaseMigrationsCreateFeatureTables(t *testing.T) {
	db := testutils.OpenTestDB(t)
	for _, table := range []string{"users", "sessions", "playback_history", "video", "liked"} {
		t.Run(table, func(t *testing.T) {
			var exists bool
			if err := db.QueryRow(context.Background(), "SELECT to_regclass($1) IS NOT NULL", "public."+table).Scan(&exists); err != nil {
				t.Fatalf("check table %q: %v", table, err)
			}
			if !exists {
				t.Errorf("migration did not create table %q", table)
			}
		})
	}
}
