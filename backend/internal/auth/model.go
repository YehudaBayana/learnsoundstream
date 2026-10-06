package auth

import (
	"time"

	"github.com/google/uuid"
)

type credentialsLoginRegister struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResponse struct {
	User authUserResponse `json:"user"`
}

type authUserResponse struct {
	ID    uuid.UUID `json:"id"`
	Email string    `json:"email"`
}

type userProfileResponse struct {
	ID            uuid.UUID `json:"id"`
	Email         string    `json:"email"`
	DisplayName   *string   `json:"displayName"`
	EmailVerified bool      `json:"emailVerified"`
	CreatedAt     time.Time `json:"createdAt"`
}

type meResponse struct {
	User userProfileResponse `json:"user"`
}

type errorResponse struct {
	Error apiError `json:"error"`
}

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
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
