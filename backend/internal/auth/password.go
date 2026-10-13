// internal/auth/password.go
package auth

import (
	"backend/internal/config"
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"

	"golang.org/x/crypto/argon2"
)

// OWASP-recommended baseline: m=19MiB, t=2, p=1.
// These are a bit stronger; tune to your server's memory budget.
const (
	argonMemory      = config.ArgonMemoryKiB
	argonIterations  = config.ArgonIterations
	argonParallelism = config.ArgonParallelism
	argonSaltLen     = config.ArgonSaltBytes
	argonKeyLen      = config.ArgonKeyBytes
)

var (
	ErrInvalidHash = errors.New("auth: invalid password hash format")
	ErrMismatch    = errors.New("auth: password does not match")
)

// DummyHash is verified against when a login email doesn't exist, so that
// "user not found" and "wrong password" take the same amount of time.
var DummyHash string

func init() {
	var err error
	DummyHash, err = HashPassword("timing-equalization-placeholder")
	if err != nil {
		panic(err)
	}
}

func HashPassword(password string) (string, error) {
	salt := make([]byte, argonSaltLen)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	key := argon2.IDKey(
		[]byte(password), salt,
		argonIterations, argonMemory, argonParallelism, argonKeyLen,
	)

	return fmt.Sprintf(
		"$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s",
		argon2.Version, argonMemory, argonIterations, argonParallelism,
		base64.RawStdEncoding.EncodeToString(salt),
		base64.RawStdEncoding.EncodeToString(key),
	), nil
}

// VerifyPassword parses the stored hash (so parameters can be upgraded later
// without breaking existing users) and compares in constant time.
func VerifyPassword(password, encoded string) error {
	parts := strings.Split(encoded, "$")
	if len(parts) != 6 || parts[1] != "argon2id" {
		return ErrInvalidHash
	}

	var version int
	if _, err := fmt.Sscanf(parts[2], "v=%d", &version); err != nil {
		return ErrInvalidHash
	}
	if version != argon2.Version {
		return ErrInvalidHash
	}

	var memory, iterations uint32
	var parallelism uint8
	if _, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &iterations, &parallelism); err != nil {
		return ErrInvalidHash
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return ErrInvalidHash
	}
	want, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil {
		return ErrInvalidHash
	}

	got := argon2.IDKey([]byte(password), salt, iterations, memory, parallelism, uint32(len(want)))
	if subtle.ConstantTimeCompare(want, got) != 1 {
		return ErrMismatch
	}
	return nil
}
