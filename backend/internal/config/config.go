package config

import (
	"fmt"
	"net/url"
	"os"
)

// Config holds all environment-driven configuration for the application.
type Config struct {
	Port        string
	DatabaseURL string
}

// Load reads configuration from environment variables, applying sensible defaults
// for local development.
func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		dbURL = os.Getenv("DATABASE_URL")
	}
	if dbURL == "" {
		sslMode := os.Getenv("DB_SSLMODE")
		if sslMode == "" {
			sslMode = "disable"
		}
		dbURL = fmt.Sprintf(
			"postgres://%s:%s@%s:%s/%s?sslmode=%s",
			url.QueryEscape(os.Getenv("DB_USER")),
			url.QueryEscape(os.Getenv("DB_PASSWORD")),
			os.Getenv("DB_HOST"),
			os.Getenv("DB_PORT"),
			os.Getenv("DB_NAME"),
			sslMode,
		)
	}

	return Config{
		Port:        port,
		DatabaseURL: dbURL,
	}
}
