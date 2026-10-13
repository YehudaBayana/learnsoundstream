package videos

import (
	"backend/internal/config"
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"backend/internal/auth"
	"backend/internal/httputil"
	"backend/internal/storage"

	"github.com/google/uuid"
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
	if limit <= 0 || limit > config.MaxVideoListLimit {
		limit = config.DefaultVideoListLimit
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

// decodeJSONBody writes the 400 response itself when the body is malformed.
func decodeJSONBody(responseWriter http.ResponseWriter, request *http.Request, destination any) bool {
	if err := json.NewDecoder(http.MaxBytesReader(responseWriter, request.Body, config.MaxMetadataBodyBytes)).Decode(destination); err != nil {
		httputil.WriteError(responseWriter, http.StatusBadRequest, "invalid_request", "malformed request body")
		return false
	}
	return true
}

// toInitUpload falls back to the file name (without extension) when no title is given.
func toInitUpload(request initUploadRequest) (InitUpload, error) {
	filename := filepath.Base(strings.TrimSpace(request.Filename))
	if filename == "." || filename == string(filepath.Separator) {
		return InitUpload{}, fmt.Errorf("%w: filename is required", ErrInvalidInput)
	}
	title := strings.TrimSpace(request.Title)
	if title == "" {
		title = strings.TrimSuffix(filename, filepath.Ext(filename))
	}

	input := InitUpload{
		Filename:  filename,
		SizeBytes: request.SizeBytes,
		MimeType:  strings.TrimSpace(request.ContentType),
		Title:     title,
		Notes:     strings.TrimSpace(request.Notes),
	}
	if request.RecordedAt != nil {
		recordedAt, err := parseRecordedAt(*request.RecordedAt)
		if err != nil {
			return InitUpload{}, err
		}
		input.RecordedAt = recordedAt
	}
	return input, nil
}

func toCompletedParts(request completeUploadRequest) []storage.CompletedPart {
	parts := make([]storage.CompletedPart, 0, len(request.Parts))
	for _, part := range request.Parts {
		parts = append(parts, storage.CompletedPart{PartNumber: part.PartNumber, ETag: part.ETag})
	}
	return parts
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
