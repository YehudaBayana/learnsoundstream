package database

import (
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
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
	if err := runMigrations(db); err != nil {
		return nil, fmt.Errorf("error running migrations: %w", err)
	}

	return db, nil
}

func runMigrations(db *sql.DB) error {
	slog.Info("Running database migrations...")

	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("could not create database driver: %w", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://migrations",
		"postgres", driver)
	if err != nil {
		return fmt.Errorf("failed to initialize migrate instance: %w", err)
	}

	if err := m.Up(); err != nil {
		if errors.Is(err, migrate.ErrNoChange) {
			slog.Info("Database migrations are up to date")
			return nil
		}
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	slog.Info("Database migrations completed successfully")
	return nil
}
