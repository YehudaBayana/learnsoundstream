package auth

import (
	"context"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
)

type ctxKey int

const sessionCtxKey ctxKey = iota

const (
	SessionCookieName = "session"
	CSRFCookieName    = "csrf_token"
	CSRFHeaderName    = "X-CSRF-Token"
)

func SessionFrom(context context.Context) *Session {
	session, _ := context.Value(sessionCtxKey).(*Session)
	return session
}

func UserIDFrom(context context.Context) (uuid.UUID, bool) {
	session := SessionFrom(context)
	if session == nil {
		return uuid.Nil, false
	}
	return session.UserID, true
}

// Auth loads the session from the cookie and puts it in the request context.
func (sessionStore *SessionStore) Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		cookie, err := request.Cookie(SessionCookieName)
		if err != nil || cookie.Value == "" {
			writeJSONError(responseWriter, http.StatusUnauthorized, "unauthenticated", "authentication required")
			return
		}

		sess, err := sessionStore.Get(request.Context(), cookie.Value)
		if err != nil {
			writeJSONError(responseWriter, http.StatusUnauthorized, "unauthenticated", "authentication required")
			return
		}

		ctx := context.WithValue(request.Context(), sessionCtxKey, sess)
		next.ServeHTTP(responseWriter, request.WithContext(ctx))
	})
}

// CSRF is a synchronizer token bound to the session.
// Must run AFTER Auth.
func (sessionStore *SessionStore) CSRF(next http.Handler) http.Handler {
	return http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		switch request.Method {
		case http.MethodGet, http.MethodHead, http.MethodOptions:
			next.ServeHTTP(responseWriter, request)
			return
		}

		sess := SessionFrom(request.Context())
		if sess == nil {
			writeJSONError(responseWriter, http.StatusForbidden, "csrf_failed", "invalid request")
			return
		}

		header := request.Header.Get(CSRFHeaderName)
		if header == "" {
			writeJSONError(responseWriter, http.StatusForbidden, "csrf_failed", "invalid request")
			return
		}

		sum := sha256.Sum256([]byte(header))
		if subtle.ConstantTimeCompare(sum[:], sess.CSRFHash) != 1 {
			writeJSONError(responseWriter, http.StatusForbidden, "csrf_failed", "invalid request")
			return
		}

		next.ServeHTTP(responseWriter, request)
	})
}

func writeJSONError(w http.ResponseWriter, status int, code, msg string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"error": map[string]string{"code": code, "message": msg},
	})
}
