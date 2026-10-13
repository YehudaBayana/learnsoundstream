// Package httputil holds small HTTP response helpers shared by feature packages.
package httputil

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

type ErrorResponse struct {
	Error ErrorBody `json:"error"`
}

type ErrorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func WriteJSON[Payload any](responseWriter http.ResponseWriter, status int, payload Payload) {
	responseWriter.Header().Set("Content-Type", "application/json; charset=utf-8")
	responseWriter.WriteHeader(status)
	if err := json.NewEncoder(responseWriter).Encode(payload); err != nil {
		slog.Error("Failed to encode JSON response", "error", err)
	}
}

func WriteError(responseWriter http.ResponseWriter, status int, code, message string) {
	WriteJSON(responseWriter, status, ErrorResponse{Error: ErrorBody{Code: code, Message: message}})
}
