package config_test

import (
	"testing"

	"backend/internal/config"
)

func TestLoadUsesDatabaseURLWhenConfigured(t *testing.T) {
	t.Setenv("DB_URL", "postgres://configured")
	t.Setenv("PORT", "8080")
	t.Setenv("DB_HOST", "ignored-host")
	t.Setenv("DB_PORT", "5433")
	t.Setenv("DB_USER", "ignored-user")
	t.Setenv("DB_PASSWORD", "ignored-password")
	t.Setenv("DB_NAME", "ignored-database")

	got := config.Load()
	if got.DatabaseURL != "postgres://configured" {
		t.Errorf("DatabaseURL = %q, want configured DB_URL", got.DatabaseURL)
	}
	if got.Port != "8080" {
		t.Errorf("Port = %q, want %q", got.Port, "8080")
	}
}

func TestLoadBuildsDatabaseURLFromParts(t *testing.T) {
	t.Setenv("DB_URL", "")
	t.Setenv("PORT", "8080")
	t.Setenv("DB_HOST", "127.0.0.1")
	t.Setenv("DB_PORT", "5432")
	t.Setenv("DB_USER", "soundstream")
	t.Setenv("DB_PASSWORD", "test-password")
	t.Setenv("DB_NAME", "soundstream_test")

	got := config.Load()
	want := "postgres://soundstream:test-password@127.0.0.1:5432/soundstream_test?sslmode=disable"
	if got.DatabaseURL != want {
		t.Errorf("DatabaseURL = %q, want %q", got.DatabaseURL, want)
	}
	if got.Port != "8080" {
		t.Errorf("Port = %q, want %q", got.Port, "8080")
	}
}
