package videos

import (
	"errors"
	"log/slog"
	"net/http"
	"time"

	"backend/internal/httputil"
)

// longTransferDeadline replaces the server-wide 10s timeouts for uploads and streams.
const longTransferDeadline = 24 * time.Hour

// allowLongTransfer extends the per-request deadlines; response writers without deadline support are left as is.
func allowLongTransfer(responseWriter http.ResponseWriter) {
	controller := http.NewResponseController(responseWriter)
	deadline := time.Now().Add(longTransferDeadline)
	if err := controller.SetReadDeadline(deadline); err != nil && !errors.Is(err, http.ErrNotSupported) {
		slog.Warn("Failed to extend read deadline", "error", err)
	}
	if err := controller.SetWriteDeadline(deadline); err != nil && !errors.Is(err, http.ErrNotSupported) {
		slog.Warn("Failed to extend write deadline", "error", err)
	}
}

// writeServiceError maps domain errors to HTTP responses without leaking internal details.
func writeServiceError(responseWriter http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrNotFound):
		httputil.WriteError(responseWriter, http.StatusNotFound, "video_not_found", "video not found")
	case errors.Is(err, ErrNotReady):
		httputil.WriteError(responseWriter, http.StatusConflict, "video_not_ready", err.Error())
	case errors.Is(err, ErrUploadTooLarge):
		httputil.WriteError(responseWriter, http.StatusRequestEntityTooLarge, "upload_too_large", err.Error())
	case errors.Is(err, ErrUnsupportedFormat):
		httputil.WriteError(responseWriter, http.StatusUnsupportedMediaType, "unsupported_video", err.Error())
	case errors.Is(err, ErrMissingFile):
		httputil.WriteError(responseWriter, http.StatusBadRequest, "missing_file", err.Error())
	case errors.Is(err, ErrInvalidUpload):
		httputil.WriteError(responseWriter, http.StatusBadRequest, "invalid_upload", err.Error())
	case errors.Is(err, ErrInvalidInput):
		httputil.WriteError(responseWriter, http.StatusBadRequest, "invalid_input", err.Error())
	default:
		slog.Error("Video request failed", "error", err)
		httputil.WriteError(responseWriter, http.StatusInternalServerError, "internal_error", "something went wrong")
	}
}
