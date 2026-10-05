// internal/auth/session.go
package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"net/netip"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrSessionNotFound = errors.New("auth: session not found")

type Session struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	CSRFHash  []byte
	ExpiresAt time.Time
}

type SessionStore struct {
	db *pgxpool.Pool

	// IdleTimeout: how long a session survives without being used.
	IdleTimeout time.Duration
	// MaxLifetime: hard ceiling regardless of activity.
	MaxLifetime time.Duration
}

func NewSessionStore(db *pgxpool.Pool) *SessionStore {
	return &SessionStore{
		db:          db,
		IdleTimeout: 30 * 24 * time.Hour,
		MaxLifetime: 90 * 24 * time.Hour,
	}
}

// randomToken returns (rawToken, sha256(rawToken)).
func randomToken(nBytes int) (string, []byte, error) {
	b := make([]byte, nBytes)
	if _, err := rand.Read(b); err != nil {
		return "", nil, err
	}
	raw := base64.RawURLEncoding.EncodeToString(b)
	sum := sha256.Sum256([]byte(raw))
	return raw, sum[:], nil
}

func (sessionStore *SessionStore) Create(
	context context.Context,
	userID uuid.UUID,
	userAgent, ip string,
) (token string, csrfToken string, session *Session, err error) {
	token, tokenHash, err := randomToken(32)
	if err != nil {
		return "", "", nil, err
	}
	csrfToken, csrfHash, err := randomToken(32)
	if err != nil {
		return "", "", nil, err
	}

	now := time.Now()
	expiresAt := now.Add(sessionStore.MaxLifetime)

	// inet column: pass a valid netip.Addr, or nil for NULL
	var ipParam any
	if a, perr := netip.ParseAddr(ip); perr == nil {
		ipParam = a
	}

	session = &Session{UserID: userID, CSRFHash: csrfHash, ExpiresAt: expiresAt}

	err = sessionStore.db.QueryRow(context, `
		INSERT INTO sessions
			(user_id, token_hash, csrf_token_hash, user_agent, ip, created_at, last_used_at, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $6, $7)
		RETURNING id`,
		userID, tokenHash, csrfHash, userAgent, ipParam, now, expiresAt,
	).Scan(&session.ID)
	if err != nil {
		return "", "", nil, err
	}

	return token, csrfToken, session, nil
}

// Get validates a raw token and returns the session.
func (sessionStore *SessionStore) Get(ctx context.Context, token string) (*Session, error) {
	sum := sha256.Sum256([]byte(token))

	var session Session
	var lastUsed time.Time

	err := sessionStore.db.QueryRow(ctx, `
		SELECT id, user_id, csrf_token_hash, expires_at, last_used_at
		FROM sessions
		WHERE token_hash = $1
		  AND expires_at > now()`,
		sum[:],
	).Scan(&session.ID, &session.UserID, &session.CSRFHash, &session.ExpiresAt, &lastUsed)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrSessionNotFound
	}
	if err != nil {
		return nil, err
	}

	// Idle expiry
	if time.Since(lastUsed) > sessionStore.IdleTimeout {
		_ = sessionStore.DeleteByID(ctx, session.ID)
		return nil, ErrSessionNotFound
	}

	// Throttle the write: at most one UPDATE per session per 5 minutes.
	if time.Since(lastUsed) > 5*time.Minute {
		_, _ = sessionStore.db.Exec(ctx,
			`UPDATE sessions SET last_used_at = now() WHERE id = $1`, session.ID)
	}

	return &session, nil
}

func (sessionStore *SessionStore) DeleteByID(ctx context.Context, id uuid.UUID) error {
	_, err := sessionStore.db.Exec(ctx, `DELETE FROM sessions WHERE id = $1`, id)
	return err
}

func (sessionStore *SessionStore) DeleteByToken(ctx context.Context, token string) error {
	sum := sha256.Sum256([]byte(token))
	_, err := sessionStore.db.Exec(ctx, `DELETE FROM sessions WHERE token_hash = $1`, sum[:])
	return err
}

// DeleteAllForUser — used for "log out everywhere" and after a password change.
func (sessionStore *SessionStore) DeleteAllForUser(ctx context.Context, userID uuid.UUID) error {
	_, err := sessionStore.db.Exec(ctx, `DELETE FROM sessions WHERE user_id = $1`, userID)
	return err
}

// CleanupExpired is meant to run on a ticker.
func (sessionStore *SessionStore) CleanupExpired(ctx context.Context) (int64, error) {
	tag, err := sessionStore.db.Exec(ctx, `DELETE FROM sessions WHERE expires_at < now()`)
	if err != nil {
		return 0, err
	}
	return tag.RowsAffected(), nil
}
