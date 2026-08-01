package database

import (
	"database/sql"
	"fmt"
	"log/slog"
	"time"

	_ "github.com/lib/pq"
)

// InitDB initializes the database connection and creates tables if they don't exist
func InitDB(connStr string) (*sql.DB, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}

	// Set connection pool parameters to prevent overwhelming the database
	db.SetMaxOpenConns(25)                 // Max open connections to the database
	db.SetMaxIdleConns(25)                 // Max idle connections in the pool
	db.SetConnMaxLifetime(5 * time.Minute) // Maximum amount of time a connection may be reused

	// Ping to verify connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error connecting to the database: %w", err)
	}

	slog.Info("Successfully connected to the database")

	// Run auto-migrations (create tables)
	if err := migrate(db); err != nil {
		return nil, fmt.Errorf("error running migrations: %w", err)
	}

	return db, nil
}

func migrate(db *sql.DB) error {
	slog.Info("Running database migrations...")

	query := `
	CREATE TABLE IF NOT EXISTS playback_history (
		user_id VARCHAR(50),
		video_id VARCHAR(50),
		play_count INT DEFAULT 1,
		last_played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY (user_id, video_id)
	);
	`

	_, err := db.Exec(query)
	if err != nil {
		return err
	}

	slog.Info("Database migrations completed successfully")
	return nil
}
