package videos

import (
	"errors"
	"log/slog"
	"net/http"

	"backend/internal/httputil"
)

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
	case errors.Is(err, ErrInvalidUpload):
		httputil.WriteError(responseWriter, http.StatusBadRequest, "invalid_upload", err.Error())
	case errors.Is(err, ErrInvalidInput):
		httputil.WriteError(responseWriter, http.StatusBadRequest, "invalid_input", err.Error())
	default:
		slog.Error("Video request failed", "error", err)
		httputil.WriteError(responseWriter, http.StatusInternalServerError, "internal_error", "something went wrong")
	}
}
