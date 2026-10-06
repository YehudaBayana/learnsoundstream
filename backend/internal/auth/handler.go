package auth

import (
	"encoding/json"
	"net"
	"net/http"
	"net/mail"
	"strings"
)

type Handler struct {
	repository *Repository
}

func NewHandler(repository *Repository) *Handler {
	return &Handler{repository: repository}
}

func (handler *Handler) HandleRegister(responseWriter http.ResponseWriter, request *http.Request) {
	var requestBody credentialsLoginRegister
	if err := json.NewDecoder(http.MaxBytesReader(responseWriter, request.Body, 1<<20)).Decode(&requestBody); err != nil {
		writeErr(responseWriter, http.StatusBadRequest, "invalid_request", "malformed request body")
		return
	}

	email := strings.ToLower(strings.TrimSpace(requestBody.Email))
	if addr, err := mail.ParseAddress(email); err != nil || addr.Address != email || len(email) > 254 {
		writeErr(responseWriter, http.StatusUnprocessableEntity, "invalid_email", "please enter a valid email address")
		return
	}
	// NIST: min 4. Cap the max so nobody can DoS you with a 10 MB password.
	if len(requestBody.Password) < 4 || len(requestBody.Password) > 50 {
		writeErr(responseWriter, http.StatusUnprocessableEntity, "weak_password", "password must be between 4 and 50 characters")
		return
	}

	passwordHash, err := HashPassword(requestBody.Password)
	if err != nil {
		writeErr(responseWriter, http.StatusInternalServerError, "internal_error", "something went wrong")
		return
	}

	userID, err := handler.repository.CreateUser(request.Context(), email, passwordHash)
	if err != nil {
		if isUniqueViolation(err) {
			writeErr(responseWriter, http.StatusConflict, "email_taken", "that email is already registered")
			return
		}
		writeErr(responseWriter, http.StatusInternalServerError, "internal_error", "something went wrong")
		return
	}

	if err := handler.repository.IssueSession(responseWriter, request, userID); err != nil {
		writeErr(responseWriter, http.StatusInternalServerError, "internal_error", "something went wrong")
		return
	}

	writeJSON(responseWriter, http.StatusCreated, authResponse{
		User: authUserResponse{ID: userID, Email: email},
	})
}

func (handler *Handler) HandleLogin(responseWriter http.ResponseWriter, request *http.Request) {
	var requestBody credentialsLoginRegister
	if err := json.NewDecoder(http.MaxBytesReader(responseWriter, request.Body, 1<<20)).Decode(&requestBody); err != nil {
		writeErr(responseWriter, http.StatusBadRequest, "invalid_request", "malformed request body")
		return
	}

	email := strings.ToLower(strings.TrimSpace(requestBody.Email))

	user, err := handler.repository.GetUserByEmail(request.Context(), email)
	if user == nil && err == nil {
		// Burn the same CPU time as a real verification.
		_ = VerifyPassword(requestBody.Password, DummyHash)
		writeErr(responseWriter, http.StatusUnauthorized, "invalid_credentials", "invalid email or password")
		return
	}
	if err != nil {
		writeErr(responseWriter, http.StatusInternalServerError, "internal_error", "something went wrong")
		return
	}

	if err := VerifyPassword(requestBody.Password, user.PassHash); err != nil {
		writeErr(responseWriter, http.StatusUnauthorized, "invalid_credentials", "invalid email or password")
		return
	}

	// Optional: transparently upgrade the hash if parameters changed.
	// if NeedsRehash(hash) { newHash, _ := HashPassword(requestBody.Password); /* UPDATE */ }

	if err := handler.repository.IssueSession(responseWriter, request, user.ID); err != nil {
		writeErr(responseWriter, http.StatusInternalServerError, "internal_error", "something went wrong")
		return
	}

	writeJSON(responseWriter, http.StatusOK, authResponse{
		User: authUserResponse{ID: user.ID, Email: email},
	})
}

func (handler *Handler) HandleLogout(responseWriter http.ResponseWriter, request *http.Request) {
	if cookie, err := request.Cookie(SessionCookieName); err == nil {
		_ = handler.repository.DeleteSession(request.Context(), cookie.Value)
	}
	handler.repository.ClearAuthCookies(responseWriter)
	responseWriter.WriteHeader(http.StatusNoContent)
}

func (handler *Handler) HandleMe(responseWriter http.ResponseWriter, request *http.Request) {
	session := SessionFrom(request.Context())

	profile, err := handler.repository.GetUserProfile(request.Context(), session.UserID)
	if err != nil {
		writeErr(responseWriter, http.StatusInternalServerError, "internal_error", "something went wrong")
		return
	}

	writeJSON(responseWriter, http.StatusOK, meResponse{
		User: userProfileResponse{
			ID:            profile.ID,
			Email:         profile.Email,
			DisplayName:   profile.Display,
			EmailVerified: profile.Verified,
			CreatedAt:     profile.CreatedAt,
		},
	})
}

// ---------- helpers ----------

func writeJSON(responseWriter http.ResponseWriter, status int, value any) {
	responseWriter.Header().Set("Content-Type", "application/json; charset=utf-8")
	responseWriter.WriteHeader(status)
	if value != nil {
		_ = json.NewEncoder(responseWriter).Encode(value)
	}
}

func writeErr(responseWriter http.ResponseWriter, status int, code, msg string) {
	writeJSON(responseWriter, status, errorResponse{
		Error: apiError{Code: code, Message: msg},
	})
}

func clientIP(request *http.Request) string {
	// Only trust X-Forwarded-For if you are actually behind a proxy you control.
	if host, _, err := net.SplitHostPort(request.RemoteAddr); err == nil {
		return host
	}
	return request.RemoteAddr
}
