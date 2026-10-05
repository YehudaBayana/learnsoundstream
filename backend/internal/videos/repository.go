package videos

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DatabaseRepository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *DatabaseRepository {
	return &DatabaseRepository{db: db}
}

func (repository *DatabaseRepository) GetByIDs(ctx context.Context, ids []string) ([]Video, error) {
	if len(ids) == 0 {
		return []Video{}, nil
	}

	rows, err := repository.db.Query(ctx, `
		SELECT id, title, channel, duration
		FROM video
		WHERE id = ANY($1)
	`, ids)
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

	transaction, err := repository.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin video metadata transaction: %w", err)
	}
	defer transaction.Rollback(ctx)

	upsertQuery := `
		INSERT INTO video (id, title, channel, duration, last_seen_at)
		VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
		ON CONFLICT (id) DO UPDATE SET
			title = EXCLUDED.title,
			channel = EXCLUDED.channel,
			duration = EXCLUDED.duration,
			updated_at = CURRENT_TIMESTAMP,
			last_seen_at = CURRENT_TIMESTAMP
	`

	for _, video := range videos {
		if video.ID == "" || video.Title == "" {
			continue
		}
		if _, err := transaction.Exec(ctx, upsertQuery, video.ID, video.Title, video.Channel, video.Duration); err != nil {
			return fmt.Errorf("upsert video metadata %q: %w", video.ID, err)
		}
	}

	if err := transaction.Commit(ctx); err != nil {
		return fmt.Errorf("commit video metadata transaction: %w", err)
	}
	return nil
}
