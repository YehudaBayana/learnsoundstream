package handlers

import (
	"database/sql"
)

// App holds all dependencies for the HTTP handlers (e.g., database connection)
type App struct {
	DB *sql.DB
}

// NewApp creates a new App instance with injected dependencies
func NewApp(db *sql.DB) *App {
	return &App{
		DB: db,
	}
}
