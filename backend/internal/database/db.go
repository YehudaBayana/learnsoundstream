package database

import (
	"context"
	"database/sql"
	"embed"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib" // Registers pgx for database/sql compatibility (used by migrations)
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

// InitDB initializes the pgx connection pool and runs auto-migrations
func InitDB(ctx context.Context, connectionString string) (*pgxpool.Pool, error) {
	// Parse the connection string into a pgxpool configuration struct
	config, err := pgxpool.ParseConfig(connectionString)
	if err != nil {
		return nil, fmt.Errorf("error parsing database config: %w", err)
	}

	// Configure pool parameters
	config.MaxConns = 25
	config.MinConns = 5
	config.MaxConnLifetime = 5 * time.Minute

	// Create the connection pool
	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("error opening database pool: %w", err)
	}

	// Ping to verify the connection works
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("error connecting to the database: %w", err)
	}

	slog.Info("Successfully connected to the database with pgxpool")

	// Run auto-migrations
	if err := runMigrations(connectionString); err != nil {
		pool.Close()
		return nil, fmt.Errorf("error running migrations: %w", err)
	}

	return pool, nil
}

func runMigrations(connectionString string) error {
	slog.Info("Running database migrations...")

	migrationSource, err := iofs.New(migrationFiles, "migrations")
	if err != nil {
		return fmt.Errorf("could not create iofs migration source: %w", err)
	}

	// Open a standard pgxpool.Pool connection using the pgx driver specifically for migrations
	sqlDB, err := sql.Open("pgx", connectionString)
	if err != nil {
		return fmt.Errorf("could not open sql connection for migrations: %w", err)
	}
	defer sqlDB.Close()

	databaseDriver, err := postgres.WithInstance(sqlDB, &postgres.Config{})
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
