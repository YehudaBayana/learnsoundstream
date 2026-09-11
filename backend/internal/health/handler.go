package health

import (
	"database/sql"
	"encoding/json"
	"log/slog"
	"net/http"
	"time"
)

var (
	Version   = "0.1.0"
	StartTime = time.Now()
)

// HealthResponse represents the structure of our health check response
type HealthResponse struct {
	Status    string    `json:"status"`
	Version   string    `json:"version"`
	Uptime    string    `json:"uptime"`
	Timestamp time.Time `json:"timestamp"`
	Services  Services  `json:"services"`
}

// Services contains placeholders for third-party services status
type Services struct {
	Database string `json:"database"`
	Cache    string `json:"cache"`
}

// Handler handles health check requests.
type Handler struct {
	database *sql.DB
}

// NewHandler creates a new health Handler with an optional database connection.
func NewHandler(database *sql.DB) *Handler {
	return &Handler{database: database}
}

// Handle handles GET /health and GET /api/health
func (handler *Handler) Handle(responseWriter http.ResponseWriter, request *http.Request) {
	databaseStatus := "disconnected"
	if handler.database != nil {
		if err := handler.database.Ping(); err == nil {
			databaseStatus = "connected"
		}
	}

	responsePayload := HealthResponse{
		Status:    "OK",
		Version:   Version,
		Uptime:    time.Since(StartTime).Round(time.Second).String(),
		Timestamp: time.Now(),
		Services: Services{
			Database: databaseStatus,
			Cache:    "disconnected (not configured)",
		},
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(responseWriter).Encode(responsePayload); err != nil {
		slog.Error("Failed to encode health response", "error", err)
	}
}
