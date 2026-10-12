package videos

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Nullable columns are COALESCEd so every row scans into plain Go values.
const videoColumns = `
	id, owner_id, title, notes, recorded_at, status,
	COALESCE(failure_reason, ''), original_name, original_key,
	COALESCE(playback_key, ''), COALESCE(thumbnail_key, ''), COALESCE(mime_type, ''),
	size_bytes, COALESCE(duration_ms, 0), COALESCE(width, 0), COALESCE(height, 0),
	created_at, updated_at`

type DatabaseRepository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *DatabaseRepository {
	return &DatabaseRepository{db: db}
}

func (repository *DatabaseRepository) Create(ctx context.Context, newVideo NewVideo) (Video, error) {
	row := repository.db.QueryRow(ctx, `
		INSERT INTO video (id, owner_id, title, notes, recorded_at, status, original_name, original_key, mime_type, size_bytes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING `+videoColumns,
		newVideo.ID, newVideo.OwnerID, newVideo.Title, newVideo.Notes, newVideo.RecordedAt, StatusProcessing,
		newVideo.OriginalName, newVideo.OriginalKey, newVideo.MimeType, newVideo.SizeBytes)

	video, err := scanVideo(row)
	if err != nil {
		return Video{}, fmt.Errorf("insert video: %w", err)
	}
	return video, nil
}

func (repository *DatabaseRepository) GetByID(ctx context.Context, ownerID, videoID uuid.UUID) (Video, error) {
	row := repository.db.QueryRow(ctx, `
		SELECT `+videoColumns+`
		FROM video
		WHERE id = $1 AND owner_id = $2`,
		videoID, ownerID)

	video, err := scanVideo(row)
	if err != nil {
		return Video{}, fmt.Errorf("select video: %w", err)
	}
	return video, nil
}

// GetByIDs returns the owner's videos in the order of videoIDs, skipping unknown or foreign ids.
func (repository *DatabaseRepository) GetByIDs(ctx context.Context, ownerID uuid.UUID, videoIDs []uuid.UUID) ([]Video, error) {
	rows, err := repository.db.Query(ctx, `
		SELECT `+videoColumns+`
		FROM video
		JOIN unnest($2::uuid[]) WITH ORDINALITY AS requested(requested_id, position) ON requested.requested_id = video.id
		WHERE video.owner_id = $1
		ORDER BY requested.position`,
		ownerID, videoIDs)
	if err != nil {
		return nil, fmt.Errorf("select videos by ids: %w", err)
	}
	return collectVideos(rows)
}

func (repository *DatabaseRepository) ListByOwner(ctx context.Context, ownerID uuid.UUID, limit, offset int) ([]Video, error) {
	rows, err := repository.db.Query(ctx, `
		SELECT `+videoColumns+`
		FROM video
		WHERE owner_id = $1
		ORDER BY recorded_at DESC NULLS LAST, created_at DESC
		LIMIT $2 OFFSET $3`,
		ownerID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("select videos by owner: %w", err)
	}
	return collectVideos(rows)
}

func (repository *DatabaseRepository) Update(ctx context.Context, ownerID, videoID uuid.UUID, update VideoUpdate) (Video, error) {
	row := repository.db.QueryRow(ctx, `
		UPDATE video
		SET title = COALESCE($3, title),
		    notes = COALESCE($4, notes),
		    recorded_at = COALESCE($5, recorded_at),
		    updated_at = now()
		WHERE id = $1 AND owner_id = $2
		RETURNING `+videoColumns,
		videoID, ownerID, update.Title, update.Notes, update.RecordedAt)

	video, err := scanVideo(row)
	if err != nil {
		return Video{}, fmt.Errorf("update video: %w", err)
	}
	return video, nil
}

// Delete removes the row and returns it so the caller can clean up the stored files.
func (repository *DatabaseRepository) Delete(ctx context.Context, ownerID, videoID uuid.UUID) (Video, error) {
	row := repository.db.QueryRow(ctx, `
		DELETE FROM video
		WHERE id = $1 AND owner_id = $2
		RETURNING `+videoColumns,
		videoID, ownerID)

	video, err := scanVideo(row)
	if err != nil {
		return Video{}, fmt.Errorf("delete video: %w", err)
	}
	return video, nil
}

func (repository *DatabaseRepository) MarkReady(ctx context.Context, ownerID, videoID uuid.UUID, result ProcessingResult) error {
	_, err := repository.db.Exec(ctx, `
		UPDATE video
		SET status = $3,
		    failure_reason = NULL,
		    playback_key = $4,
		    thumbnail_key = $5,
		    mime_type = $6,
		    duration_ms = $7,
		    width = $8,
		    height = $9,
		    updated_at = now()
		WHERE id = $1 AND owner_id = $2`,
		videoID, ownerID, StatusReady, result.PlaybackKey, result.ThumbnailKey, result.MimeType,
		result.DurationMs, result.Width, result.Height)
	if err != nil {
		return fmt.Errorf("mark video ready: %w", err)
	}
	return nil
}

func (repository *DatabaseRepository) MarkFailed(ctx context.Context, ownerID, videoID uuid.UUID, reason string) error {
	_, err := repository.db.Exec(ctx, `
		UPDATE video
		SET status = $3,
		    failure_reason = $4,
		    updated_at = now()
		WHERE id = $1 AND owner_id = $2`,
		videoID, ownerID, StatusFailed, reason)
	if err != nil {
		return fmt.Errorf("mark video failed: %w", err)
	}
	return nil
}

// ListProcessing is deliberately not owner-scoped: it lets the worker resume videos after a restart.
func (repository *DatabaseRepository) ListProcessing(ctx context.Context) ([]Video, error) {
	rows, err := repository.db.Query(ctx, `
		SELECT `+videoColumns+`
		FROM video
		WHERE status = $1
		ORDER BY created_at`,
		StatusProcessing)
	if err != nil {
		return nil, fmt.Errorf("select processing videos: %w", err)
	}
	return collectVideos(rows)
}

func scanVideo(row pgx.Row) (Video, error) {
	var video Video
	err := row.Scan(
		&video.ID, &video.OwnerID, &video.Title, &video.Notes, &video.RecordedAt, &video.Status,
		&video.FailureReason, &video.OriginalName, &video.OriginalKey,
		&video.PlaybackKey, &video.ThumbnailKey, &video.MimeType,
		&video.SizeBytes, &video.DurationMs, &video.Width, &video.Height,
		&video.CreatedAt, &video.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return Video{}, ErrNotFound
	}
	return video, err
}

func collectVideos(rows pgx.Rows) ([]Video, error) {
	defer rows.Close()

	videos := make([]Video, 0)
	for rows.Next() {
		video, err := scanVideo(rows)
		if err != nil {
			return nil, fmt.Errorf("scan video: %w", err)
		}
		videos = append(videos, video)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate videos: %w", err)
	}
	return videos, nil
}
