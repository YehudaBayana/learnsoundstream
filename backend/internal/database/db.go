package database

import (
	"database/sql"
	"embed"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	_ "github.com/lib/pq"
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

// InitDB initializes the database connection and creates tables if they don't exist
func InitDB(connectionString string) (*sql.DB, error) {
	databaseConnection, err := sql.Open("postgres", connectionString)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}

	// Set connection pool parameters to prevent overwhelming the database
	databaseConnection.SetMaxOpenConns(25)                 // Max open connections to the database
	databaseConnection.SetMaxIdleConns(25)                 // Max idle connections in the pool
	databaseConnection.SetConnMaxLifetime(5 * time.Minute) // Maximum amount of time a connection may be reused

	// Ping to verify connection
	if err := databaseConnection.Ping(); err != nil {
		return nil, fmt.Errorf("error connecting to the database: %w", err)
	}

	slog.Info("Successfully connected to the database")

	// Run auto-migrations (create tables)
	if err := runMigrations(databaseConnection); err != nil {
		return nil, fmt.Errorf("error running migrations: %w", err)
	}

	return databaseConnection, nil
}

func runMigrations(databaseConnection *sql.DB) error {
	slog.Info("Running database migrations...")

	// Use embed.FS so the SQL files are compiled into the binary,
	// making the binary self-contained regardless of working directory.
	migrationSource, err := iofs.New(migrationFiles, "migrations")
	if err != nil {
		return fmt.Errorf("could not create iofs migration source: %w", err)
	}

	databaseDriver, err := postgres.WithInstance(databaseConnection, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("could not create database driver: %w", err)
	}

	migrator, err := migrate.NewWithInstance("iofs", migrationSource, "postgres", databaseDriver)
	if err != nil {
		return fmt.Errorf("failed to initialize migrate instance: %w", err)
	}

	if err := migrator.Up(); err != nil {
		if errors.Is(err, migrate.ErrNoChange) {
			slog.Info("Database migrations are up to date")
			return nil
		}
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	slog.Info("Database migrations completed successfully")
	return nil
}
