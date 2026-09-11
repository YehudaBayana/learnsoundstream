package config

import "os"

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

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://soundstream:password123@localhost:5432/soundstream?sslmode=disable"
	}

	return Config{
		Port:        port,
		DatabaseURL: dbURL,
	}
}
