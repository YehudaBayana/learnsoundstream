package logging

import (
	"log/slog"
	"net/http"
	"runtime/debug"
	"time"

	"backend/internal/httputil"
)

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (recorder *statusRecorder) WriteHeader(status int) {
	recorder.status = status
	recorder.ResponseWriter.WriteHeader(status)
}

// Unwrap lets http.ResponseController reach the real writer (deadlines, flushing).
func (recorder *statusRecorder) Unwrap() http.ResponseWriter {
	return recorder.ResponseWriter
}

// Middleware logs one line per request and turns panics into a logged 500.
func Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		recorder := &statusRecorder{ResponseWriter: responseWriter, status: http.StatusOK}
		startedAt := time.Now()

		defer func() {
			if recovered := recover(); recovered != nil {
				slog.Error("Request panicked",
					"panic", recovered,
					"stack", string(debug.Stack()),
					"method", request.Method,
					"path", request.URL.Path,
				)
				httputil.WriteError(recorder, http.StatusInternalServerError, "internal_error", "Internal server error")
				recorder.status = http.StatusInternalServerError
			}
			if request.URL.Path == "/health" || request.URL.Path == "/api/health" {
				return // Docker healthchecks would flood the logs.
			}
			slog.Info("HTTP request",
				"method", request.Method,
				"path", request.URL.Path,
				"status", recorder.status,
				"duration_ms", time.Since(startedAt).Milliseconds(),
			)
		}()

		next.ServeHTTP(recorder, request)
	})
}
