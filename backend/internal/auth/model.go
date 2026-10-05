package auth

import (
	"time"

	"github.com/google/uuid"
)

type credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type userRow struct {
	ID       uuid.UUID
	Email    string
	PassHash string
}

type userProfileRow struct {
	ID        uuid.UUID
	Email     string
	Display   *string
	Verified  bool
	CreatedAt time.Time
}
