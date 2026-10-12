package liked

import (
	"context"
	"fmt"

	"backend/internal/videos"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db           *pgxpool.Pool
	videoService *videos.Service
}

func NewRepository(db *pgxpool.Pool, videoService *videos.Service) *Repository {
	return &Repository{db: db, videoService: videoService}
}

// GetLikedVideos returns the user's liked videos, most recently liked first.
func (repository *Repository) GetLikedVideos(ctx context.Context, userID uuid.UUID, limit, offset int) ([]videos.Video, error) {
	rows, err := repository.db.Query(ctx, `
		SELECT id
		FROM liked
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`,
		userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("select liked ids: %w", err)
	}
	likedVideoIDs, err := pgx.CollectRows(rows, pgx.RowTo[uuid.UUID])
	if err != nil {
		return nil, fmt.Errorf("collect liked ids: %w", err)
	}

	return repository.videoService.GetByIDs(ctx, userID, likedVideoIDs)
}

// PostLikedVideo is idempotent and only accepts videos owned by the user.
func (repository *Repository) PostLikedVideo(ctx context.Context, userID, videoID uuid.UUID) error {
	if _, err := repository.videoService.Get(ctx, userID, videoID); err != nil {
		return err
	}

	_, err := repository.db.Exec(ctx, `
		INSERT INTO liked (user_id, id, created_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (user_id, id) DO NOTHING`,
		userID, videoID)
	if err != nil {
		return fmt.Errorf("insert liked video: %w", err)
	}
	return nil
}
