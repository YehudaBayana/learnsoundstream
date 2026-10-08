# Soundstream Backend

This is the high-performance Go backend for the Soundstream music streaming platform.

## Architecture & Design Decisions

In line with the project's learning goals (defined in [PROJECT_GOALS.md](../PROJECT_GOALS.md)), this backend is built with **zero external frameworks** to promote a raw understanding of HTTP, concurrency, and system-level operations.

### Key Features

- **Modern Routing:** Uses native `net/http` package (routing patterns with HTTP methods introduced in Go 1.27.0+).
- **Graceful Shutdown:** Actively listens for OS interruption signals (`SIGINT`, `SIGTERM`) to clean up resources, cancel contexts, and drain active connections safely.
- **Production-Ready Timeouts:** Configured with robust `ReadTimeout`, `WriteTimeout`, and `IdleTimeout` to prevent resource starvation (e.g., slowloris attacks).
- **Structured Logging:** Utilizes standard `log/slog` for fast, structured, context-aware logging.
- **CORS-Enabled:** Pre-configured middleware to handle preflight and API requests from the Next.js frontend (running on `http://localhost:3000`).

---

## Getting Started

### Prerequisites

- Go (version 1.22 or higher)

### Run the Server

Run the following command from this directory:

```bash
go run cmd/server/main.go
```

The server will start on port `8080` by default: `http://localhost:8080`.

To run on a different port, set the `PORT` environment variable:

```bash
PORT=9000 go run cmd/server/main.go
```

---

## API Endpoints

### 1. Health Check

Checks the status of the server and sub-services.

- **URL:** `/health` or `/api/health`
- **Method:** `GET`
- **Headers:** None
- **Response Format:** JSON

#### Example Response:

```json
{
  "status": "OK",
  "version": "0.1.0",
  "uptime": "5s",
  "timestamp": "2026-05-17T17:05:00Z",
  "services": {
    "database": "disconnected (not configured)",
    "cache": "disconnected (not configured)"
  }
}
```
