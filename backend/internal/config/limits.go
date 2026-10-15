package config

import "time"

// Single source of truth for every limit, size, timeout and threshold in the backend.
// Change a value here instead of hardcoding a number elsewhere.

const (
	KiB int64 = 1024
	MiB       = 1024 * KiB
	GiB       = 1024 * MiB
)

// Uploads.
const (
	TwentyGiB             = 20 * GiB
	DefaultMaxUploadBytes = TwentyGiB
	// 64 MiB parts keep a 20 GiB file at 320 parts, far below the 10,000-part limit; R2 needs equal sizes except the last.
	UploadPartBytes             = 64 * MiB
	MaxPresignedPartsPerRequest = 100
	MaxMetadataBodyBytes        = 1 * MiB
	UploadSessionLifetime       = 24 * time.Hour
	UploadJanitorInterval       = time.Hour
	DefaultUploadURLTTL         = time.Hour
	DefaultPlaybackURLTTL       = 2 * time.Hour
	ThumbnailRedirectMaxAge     = 5 * time.Minute
)

// Video processing.
const (
	ProcessingTimeout    = time.Hour
	ProcessingQueueSize  = 32
	ThumbnailWidth       = 640
	PlaybackMaxHeight    = 720
	FFmpegThreads        = 1
	MaxCommandErrorBytes = 1000
)

// Pagination.
const (
	DefaultVideoListLimit = 50
	MaxVideoListLimit     = 200
	DefaultLikedListLimit = 10
)

// Auth.
const (
	MaxEmailLength     = 254
	MinPasswordLength  = 4
	MaxPasswordLength  = 50
	SessionIdleTimeout = 30 * 24 * time.Hour
	SessionMaxLifetime = 90 * 24 * time.Hour
	SessionTokenBytes  = 32
	ArgonMemoryKiB     = 19 * 1024
	ArgonIterations    = 3
	ArgonParallelism   = 2
	ArgonSaltBytes     = 16
	ArgonKeyBytes      = 32
)

// HTTP server.
const (
	ServerReadTimeout     = 10 * time.Second
	ServerWriteTimeout    = 10 * time.Second
	ServerIdleTimeout     = 120 * time.Second
	ServerShutdownTimeout = 15 * time.Second
)

// Database pool.
const (
	DatabaseMaxConnections  = 10
	DatabaseMaxConnLifetime = 5 * time.Minute
	DatabaseMaxConnIdleTime = 2 * time.Minute
)
