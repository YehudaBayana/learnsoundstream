package videos

import (
	"encoding/json"
	"net/http"
	"strings"

	"backend/internal/httputil"

	"github.com/google/uuid"
)

const (
	maxMetadataBodyBytes = 1 << 20
	// Headroom for the multipart text fields and boundaries around the file itself.
	multipartOverheadBytes = 1 << 20
	playbackContentType    = "video/mp4"
	thumbnailContentType   = "image/jpeg"
)

type Handler struct {
	service        *Service
	processor      *Processor
	maxUploadBytes int64
}

func NewHandler(service *Service, processor *Processor, maxUploadBytes int64) *Handler {
	return &Handler{service: service, processor: processor, maxUploadBytes: maxUploadBytes}
}

func (handler *Handler) HandleCreate(responseWriter http.ResponseWriter, request *http.Request) {
	ownerID, ok := authenticatedUserID(responseWriter, request)
	if !ok {
		return
	}
	if !strings.HasPrefix(request.Header.Get("Content-Type"), "multipart/form-data") {
		httputil.WriteError(responseWriter, http.StatusUnsupportedMediaType, "unsupported_content_type", "upload must be multipart/form-data")
		return
	}

	allowLongTransfer(responseWriter)
	request.Body = http.MaxBytesReader(responseWriter, request.Body, handler.maxUploadBytes+multipartOverheadBytes)
	multipartReader, err := request.MultipartReader()
	if err != nil {
		writeServiceError(responseWriter, ErrInvalidUpload)
		return
	}

	videoID := uuid.New()
	upload, err := receiveUpload(request.Context(), handler.service, multipartReader, ownerID, videoID, handler.maxUploadBytes)
	if err != nil {
		writeServiceError(responseWriter, err)
		return
	}

	video, err := handler.service.Create(request.Context(), NewVideo{
		ID:           videoID,
		OwnerID:      ownerID,
		Title:        upload.Title,
		Notes:        upload.Notes,
		RecordedAt:   upload.RecordedAt,
		OriginalName: upload.OriginalName,
		OriginalKey:  upload.OriginalKey,
		MimeType:     upload.MimeType,
		SizeBytes:    upload.SizeBytes,
	})
	if err != nil {
		writeServiceError(responseWriter, err)
		return
	}

	handler.processor.Enqueue(video)
	httputil.WriteJSON(responseWriter, http.StatusCreated, video)
}

func (handler *Handler) HandleList(responseWriter http.ResponseWriter, request *http.Request) {
	ownerID, ok := authenticatedUserID(responseWriter, request)
	if !ok {
		return
	}

	limit, offset := parsePagination(request)
	videos, err := handler.service.List(request.Context(), ownerID, limit, offset)
	if err != nil {
		writeServiceError(responseWriter, err)
		return
	}
	httputil.WriteJSON(responseWriter, http.StatusOK, videos)
}

func (handler *Handler) HandleGet(responseWriter http.ResponseWriter, request *http.Request) {
	ownerID, videoID, ok := ownedVideoIDs(responseWriter, request)
	if !ok {
		return
	}

	video, err := handler.service.Get(request.Context(), ownerID, videoID)
	if err != nil {
		writeServiceError(responseWriter, err)
		return
	}
	httputil.WriteJSON(responseWriter, http.StatusOK, video)
}

func (handler *Handler) HandleUpdate(responseWriter http.ResponseWriter, request *http.Request) {
	ownerID, videoID, ok := ownedVideoIDs(responseWriter, request)
	if !ok {
		return
	}

	var requestBody updateVideoRequest
	if err := json.NewDecoder(http.MaxBytesReader(responseWriter, request.Body, maxMetadataBodyBytes)).Decode(&requestBody); err != nil {
		httputil.WriteError(responseWriter, http.StatusBadRequest, "invalid_request", "malformed request body")
		return
	}
	update, err := toVideoUpdate(requestBody)
	if err != nil {
		writeServiceError(responseWriter, err)
		return
	}

	video, err := handler.service.Update(request.Context(), ownerID, videoID, update)
	if err != nil {
		writeServiceError(responseWriter, err)
		return
	}
	httputil.WriteJSON(responseWriter, http.StatusOK, video)
}

func (handler *Handler) HandleDelete(responseWriter http.ResponseWriter, request *http.Request) {
	ownerID, videoID, ok := ownedVideoIDs(responseWriter, request)
	if !ok {
		return
	}

	if err := handler.service.Delete(request.Context(), ownerID, videoID); err != nil {
		writeServiceError(responseWriter, err)
		return
	}
	responseWriter.WriteHeader(http.StatusNoContent)
}

// HandleStream serves the playback file; http.ServeContent handles Range, If-Range and 206 responses.
func (handler *Handler) HandleStream(responseWriter http.ResponseWriter, request *http.Request) {
	ownerID, videoID, ok := ownedVideoIDs(responseWriter, request)
	if !ok {
		return
	}

	file, modTime, err := handler.service.OpenPlayback(request.Context(), ownerID, videoID)
	if err != nil {
		writeServiceError(responseWriter, err)
		return
	}
	defer file.Close()

	allowLongTransfer(responseWriter)
	responseWriter.Header().Set("Content-Type", playbackContentType)
	responseWriter.Header().Set("Cache-Control", "private")
	http.ServeContent(responseWriter, request, "", modTime, file)
}

func (handler *Handler) HandleThumbnail(responseWriter http.ResponseWriter, request *http.Request) {
	ownerID, videoID, ok := ownedVideoIDs(responseWriter, request)
	if !ok {
		return
	}

	file, modTime, err := handler.service.OpenThumbnail(request.Context(), ownerID, videoID)
	if err != nil {
		writeServiceError(responseWriter, err)
		return
	}
	defer file.Close()

	responseWriter.Header().Set("Content-Type", thumbnailContentType)
	responseWriter.Header().Set("Cache-Control", "private")
	http.ServeContent(responseWriter, request, "", modTime, file)
}
