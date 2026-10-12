package videos

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"backend/internal/auth"
	"backend/internal/httputil"

	"github.com/google/uuid"
)

const (
	defaultListLimit = 50
	maxListLimit     = 200
)

func supportedVideoExtension(filename string) (string, bool) {
	extension := strings.ToLower(filepath.Ext(filename))
	switch extension {
	case ".mp4", ".mov", ".avi", ".webm", ".mkv", ".m4v":
		return extension, true
	default:
		return "", false
	}
}

// parseRecordedAt accepts a plain date or an RFC3339 timestamp; an empty value means "not set".
func parseRecordedAt(value string) (*time.Time, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil, nil
	}
	for _, layout := range []string{time.DateOnly, time.RFC3339} {
		if parsed, err := time.Parse(layout, value); err == nil {
			return &parsed, nil
		}
	}
	return nil, fmt.Errorf("%w: recorded_at must be YYYY-MM-DD or RFC3339", ErrInvalidInput)
}

// parsePagination falls back to defaults for missing or out-of-range values.
func parsePagination(request *http.Request) (limit, offset int) {
	limit, _ = strconv.Atoi(request.URL.Query().Get("limit"))
	if limit <= 0 || limit > maxListLimit {
		limit = defaultListLimit
	}
	offset, _ = strconv.Atoi(request.URL.Query().Get("offset"))
	if offset < 0 {
		offset = 0
	}
	return limit, offset
}

func authenticatedUserID(responseWriter http.ResponseWriter, request *http.Request) (uuid.UUID, bool) {
	userID, ok := auth.UserIDFrom(request.Context())
	if !ok {
		httputil.WriteError(responseWriter, http.StatusUnauthorized, "unauthenticated", "authentication required")
	}
	return userID, ok
}

// ownedVideoIDs returns the caller's id and the {id} path value; it writes the error response itself.
// A malformed id is treated like an unknown video.
func ownedVideoIDs(responseWriter http.ResponseWriter, request *http.Request) (ownerID, videoID uuid.UUID, ok bool) {
	ownerID, ok = authenticatedUserID(responseWriter, request)
	if !ok {
		return uuid.Nil, uuid.Nil, false
	}
	videoID, err := uuid.Parse(request.PathValue("id"))
	if err != nil {
		writeServiceError(responseWriter, ErrNotFound)
		return uuid.Nil, uuid.Nil, false
	}
	return ownerID, videoID, true
}

func toVideoUpdate(request updateVideoRequest) (VideoUpdate, error) {
	update := VideoUpdate{Title: request.Title, Notes: request.Notes}
	if update.Title != nil {
		trimmedTitle := strings.TrimSpace(*update.Title)
		if trimmedTitle == "" {
			return VideoUpdate{}, fmt.Errorf("%w: title cannot be empty", ErrInvalidInput)
		}
		update.Title = &trimmedTitle
	}
	if request.RecordedAt != nil {
		recordedAt, err := parseRecordedAt(*request.RecordedAt)
		if err != nil {
			return VideoUpdate{}, err
		}
		update.RecordedAt = recordedAt
	}
	return update, nil
}
