package config

import (
	"fmt"
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
	dbURL := os.Getenv("DB_URL")
	port := os.Getenv("PORT")
if dbURL == "" {
    host := os.Getenv("DB_HOST")
    port := os.Getenv("DB_PORT")
    user := os.Getenv("DB_USER")
    password := os.Getenv("DB_PASSWORD")
    name := os.Getenv("DB_NAME")
    dbURL = fmt.Sprintf(
        "postgres://%s:%s@%s:%s/%s?sslmode=disable",
        user, password, host, port, name,
    )
}

	return Config{
		Port:        port,
		DatabaseURL: dbURL,
	}
}
