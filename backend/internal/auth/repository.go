package auth

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	sessions      *SessionStore
	db            *pgxpool.Pool
	secureCookies bool
}

func NewRepository(sessions *SessionStore, db *pgxpool.Pool, secureCookies bool) *Repository {
	return &Repository{
		sessions:      sessions,
		db:            db,
		secureCookies: secureCookies,
	}
}

func (repository *Repository) CreateUser(requestContext context.Context, email, passwordHash string) (uuid.UUID, error) {
	var userID uuid.UUID
	err := repository.db.QueryRow(requestContext,
		`INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id`,
		email, passwordHash,
	).Scan(&userID)
	return userID, err
}

func (repository *Repository) GetUserByEmail(requestContext context.Context, email string) (*userRow, error) {
	var row userRow
	err := repository.db.QueryRow(requestContext,
		`SELECT id, email, password_hash FROM users WHERE email = $1`, email,
	).Scan(&row.ID, &row.Email, &row.PassHash)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &row, nil
}

func (repository *Repository) GetUserProfile(requestContext context.Context, userID uuid.UUID) (*userProfileRow, error) {
	var row userProfileRow
	var verifiedAt *time.Time
	err := repository.db.QueryRow(requestContext, `
		SELECT id, email, display_name, email_verified_at, created_at
		FROM users WHERE id = $1`, userID,
	).Scan(&row.ID, &row.Email, &row.Display, &verifiedAt, &row.CreatedAt)
	if err != nil {
		return nil, err
	}
	row.Verified = verifiedAt != nil
	return &row, nil
}

func (repository *Repository) IssueSession(responseWriter http.ResponseWriter, request *http.Request, userID uuid.UUID) error {
	token, csrf, _, err := repository.sessions.Create(
		request.Context(), userID, request.UserAgent(), clientIP(request),
	)
	if err != nil {
		return err
	}
	repository.setAuthCookies(responseWriter, token, csrf, int(repository.sessions.MaxLifetime.Seconds()))
	return nil
}

func (repository *Repository) DeleteSession(requestContext context.Context, token string) error {
	return repository.sessions.DeleteByToken(requestContext, token)
}

func (repository *Repository) ClearAuthCookies(responseWriter http.ResponseWriter) {
	for _, name := range []string{SessionCookieName, CSRFCookieName} {
		http.SetCookie(responseWriter, &http.Cookie{
			Name:     name,
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			HttpOnly: name == SessionCookieName,
			Secure:   repository.secureCookies,
			SameSite: http.SameSiteLaxMode,
		})
	}
}

// ---------- internal helpers ----------

func (repository *Repository) setAuthCookies(responseWriter http.ResponseWriter, token, csrf string, maxAge int) {
	http.SetCookie(responseWriter, &http.Cookie{
		Name:     SessionCookieName,
		Value:    token,
		Path:     "/",
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   repository.secureCookies,
		SameSite: http.SameSiteLaxMode,
	})
	// Readable by JS on purpose — the SPA echoes it back in X-CSRF-Token.
	// Safe because it is bound to the session server-side.
	http.SetCookie(responseWriter, &http.Cookie{
		Name:     CSRFCookieName,
		Value:    csrf,
		Path:     "/",
		MaxAge:   maxAge,
		HttpOnly: false,
		Secure:   repository.secureCookies,
		SameSite: http.SameSiteLaxMode,
	})
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
