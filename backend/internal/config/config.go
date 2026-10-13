package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"time"
)

// Config holds all environment-driven configuration for the application.
type Config struct {
	Port              string
	DatabaseURL       string
	MaxUploadBytes    int64
	Env               string
	R2AccountID       string
	R2AccessKeyID     string
	R2SecretAccessKey string
	R2Bucket          string
	R2Endpoint        string
	UploadURLTTL      time.Duration
	PlaybackURLTTL    time.Duration
}

// Load reads configuration from environment variables, applying sensible defaults
// for local development.
func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	maxUploadBytes := DefaultMaxUploadBytes
	if value := os.Getenv("MAX_UPLOAD_BYTES"); value != "" {
		parsed, err := strconv.ParseInt(value, 10, 64)
		if err == nil && parsed > 0 {
			maxUploadBytes = parsed
		}
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
		Port:              port,
		DatabaseURL:       dbURL,
		MaxUploadBytes:    maxUploadBytes,
		Env:               os.Getenv("ENV"),
		R2AccountID:       os.Getenv("R2_ACCOUNT_ID"),
		R2AccessKeyID:     os.Getenv("R2_ACCESS_KEY_ID"),
		R2SecretAccessKey: os.Getenv("R2_SECRET_ACCESS_KEY"),
		R2Bucket:          os.Getenv("R2_BUCKET"),
		R2Endpoint:        os.Getenv("R2_ENDPOINT"),
		UploadURLTTL:      durationFromEnv("UPLOAD_URL_TTL", DefaultUploadURLTTL),
		PlaybackURLTTL:    durationFromEnv("PLAYBACK_URL_TTL", DefaultPlaybackURLTTL),
	}
}

// durationFromEnv falls back to the default for missing or invalid values.
func durationFromEnv(name string, fallback time.Duration) time.Duration {
	parsed, err := time.ParseDuration(os.Getenv(name))
	if err != nil || parsed <= 0 {
		return fallback
	}
	return parsed
}
