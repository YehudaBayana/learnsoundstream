package videos

import (
	"fmt"
	"net/http"
	"time"

	"backend/internal/httputil"
)

const (
	maxMetadataBodyBytes = 1 << 20
	playbackContentType  = "video/mp4"
	thumbnailContentType = "image/jpeg"
	// Browsers may reuse the redirect target until shortly before its signature expires.
	thumbnailRedirectMaxAge = 5 * time.Minute
)

type Handler struct {
	service   *Service
	processor *Processor
}

func NewHandler(service *Service, processor *Processor) *Handler {
	return &Handler{service: service, processor: processor}
}

// HandleInitUpload opens a multipart upload; the browser then sends the parts straight to storage.
func (handler *Handler) HandleInitUpload(responseWriter http.ResponseWriter, request *http.Request) {
	ownerID, ok := authenticatedUserID(responseWriter, request)
	if !ok {
		return
	}
	var requestBody initUploadRequest
	if !decodeJSONBody(responseWriter, request, &requestBody) {
		return
	}
	input, err := toInitUpload(requestBody)
	if err != nil {
		writeServiceError(responseWriter, err)
		return
	}

	session, err := handler.service.InitUpload(request.Context(), ownerID, input)
	if err != nil {
		writeServiceError(responseWriter, err)
		return
	}
	httputil.WriteJSON(responseWriter, http.StatusCreated, session)
}

func (handler *Handler) HandlePresignParts(responseWriter http.ResponseWriter, request *http.Request) {
	ownerID, videoID, ok := ownedVideoIDs(responseWriter, request)
	if !ok {
		return
	}
	var requestBody presignPartsRequest
	if !decodeJSONBody(responseWriter, request, &requestBody) {
		return
	}

	urls, err := handler.service.PresignParts(request.Context(), ownerID, videoID, requestBody.PartNumbers)
	if err != nil {
		writeServiceError(responseWriter, err)
		return
	}
	httputil.WriteJSON(responseWriter, http.StatusOK, urls)
}

func (handler *Handler) HandleCompleteUpload(responseWriter http.ResponseWriter, request *http.Request) {
	ownerID, videoID, ok := ownedVideoIDs(responseWriter, request)
	if !ok {
		return
	}
	var requestBody completeUploadRequest
	if !decodeJSONBody(responseWriter, request, &requestBody) {
		return
	}

	video, err := handler.service.CompleteUpload(request.Context(), ownerID, videoID, toCompletedParts(requestBody))
	if err != nil {
		writeServiceError(responseWriter, err)
		return
	}
	handler.processor.Enqueue(video)
	httputil.WriteJSON(responseWriter, http.StatusOK, video)
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
	if !decodeJSONBody(responseWriter, request, &requestBody) {
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

// HandlePlaybackURL returns a presigned URL; the browser's video element then makes Range requests to storage directly.
func (handler *Handler) HandlePlaybackURL(responseWriter http.ResponseWriter, request *http.Request) {
	ownerID, videoID, ok := ownedVideoIDs(responseWriter, request)
	if !ok {
		return
	}

	signedURL, err := handler.service.PlaybackURL(request.Context(), ownerID, videoID)
	if err != nil {
		writeServiceError(responseWriter, err)
		return
	}
	responseWriter.Header().Set("Cache-Control", "no-store")
	httputil.WriteJSON(responseWriter, http.StatusOK, signedURL)
}

// HandleThumbnail redirects to a presigned URL so grids of <img> tags need no extra round trip to the client code.
func (handler *Handler) HandleThumbnail(responseWriter http.ResponseWriter, request *http.Request) {
	ownerID, videoID, ok := ownedVideoIDs(responseWriter, request)
	if !ok {
		return
	}

	signedURL, err := handler.service.ThumbnailURL(request.Context(), ownerID, videoID)
	if err != nil {
		writeServiceError(responseWriter, err)
		return
	}
	responseWriter.Header().Set("Cache-Control", fmt.Sprintf("private, max-age=%d", int(thumbnailRedirectMaxAge.Seconds())))
	http.Redirect(responseWriter, request, signedURL.URL, http.StatusFound)
}
