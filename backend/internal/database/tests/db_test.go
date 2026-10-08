package database_test

import (
	"context"
	"testing"

	"backend/internal/database"
)

func TestInitDBRejectsInvalidConnectionString(t *testing.T) {
	if _, err := database.InitDB(context.Background(), "not-a-postgres-url"); err == nil {
		t.Fatal("InitDB() error = nil, want invalid connection string error")
	}
}
