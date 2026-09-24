package videos

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/lib/pq"
)

type DatabaseRepository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *DatabaseRepository {
	return &DatabaseRepository{db: db}
}

func (repository *DatabaseRepository) GetByIDs(ctx context.Context, ids []string) ([]Video, error) {
	if len(ids) == 0 {
		return []Video{}, nil
	}

	rows, err := repository.db.QueryContext(ctx, `
		SELECT id, title, channel, duration
		FROM video
		WHERE id = ANY($1)
	`, pq.Array(ids))
	if err != nil {
		return nil, fmt.Errorf("query video metadata: %w", err)
	}
	defer rows.Close()

	byID := make(map[string]Video, len(ids))
	for rows.Next() {
		var video Video
		if err := rows.Scan(&video.ID, &video.Title, &video.Channel, &video.Duration); err != nil {
			return nil, fmt.Errorf("scan video metadata: %w", err)
		}
		byID[video.ID] = video.WithDerivedFields()
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate video metadata: %w", err)
	}

	results := make([]Video, 0, len(byID))
	for _, id := range ids {
		if video, found := byID[id]; found {
			results = append(results, video)
		}
	}
	return results, nil
}

func (repository *DatabaseRepository) UpsertMany(ctx context.Context, videos []Video) error {
	if len(videos) == 0 {
		return nil
	}

	transaction, err := repository.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin video metadata transaction: %w", err)
	}
	defer transaction.Rollback()

	statement, err := transaction.PrepareContext(ctx, `
		INSERT INTO video (id, title, channel, duration, last_seen_at)
		VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
		ON CONFLICT (id) DO UPDATE SET
			title = EXCLUDED.title,
			channel = EXCLUDED.channel,
			duration = EXCLUDED.duration,
			updated_at = CURRENT_TIMESTAMP,
			last_seen_at = CURRENT_TIMESTAMP
	`)
	if err != nil {
		return fmt.Errorf("prepare video metadata upsert: %w", err)
	}
	defer statement.Close()

	for _, video := range videos {
		if video.ID == "" || video.Title == "" {
			continue
		}
		if _, err := statement.ExecContext(ctx, video.ID, video.Title, video.Channel, video.Duration); err != nil {
			return fmt.Errorf("upsert video metadata %q: %w", video.ID, err)
		}
	}

	if err := transaction.Commit(); err != nil {
		return fmt.Errorf("commit video metadata transaction: %w", err)
	}
	return nil
}
