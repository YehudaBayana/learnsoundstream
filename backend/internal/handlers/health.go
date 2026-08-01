package handlers

import (
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

// HealthHandler handles GET /health and GET /api/health
func (app *App) HealthHandler(w http.ResponseWriter, r *http.Request) {
	dbStatus := "disconnected"
	if app.DB != nil {
		if err := app.DB.Ping(); err == nil {
			dbStatus = "connected"
		}
	}

	resp := HealthResponse{
		Status:    "OK",
		Version:   Version,
		Uptime:    time.Since(StartTime).Round(time.Second).String(),
		Timestamp: time.Now(),
		Services: Services{
			Database: dbStatus,
			Cache:    "disconnected (not configured)",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(resp); err != nil {
		slog.Error("Failed to encode health response", "error", err)
	}
}
