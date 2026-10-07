package liked

import (
	"context"
	"errors"

	"github.com/google/uuid"

	"backend/internal/videos"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db           *pgxpool.Pool
	videoService *videos.Service
}

func NewRepository(db *pgxpool.Pool, videoService *videos.Service) *Repository {
	return &Repository{
		db:           db,
		videoService: videoService,
	}
}

func (repository *Repository) GetLikedVideos(requestContext context.Context, userID uuid.UUID, limit int, offset int) ([]GetVideosInfoResult, error) {
	if repository.db == nil {
		return nil, errors.New("database connection is nil")
	}

	rows, err := repository.db.Query(requestContext, `
    SELECT user_id, id, created_at
    FROM liked
    WHERE user_id = $1
    ORDER BY created_at DESC
	LIMIT $2 OFFSET $3
    `, userID, limit, offset)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var videoIDs []string
	for rows.Next() {
		var item Liked
		if err := rows.Scan(&item.UserID, &item.ID, &item.CreatedAt); err != nil {
			return nil, err
		}
		videoIDs = append(videoIDs, item.ID)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	if len(videoIDs) == 0 {
		return []GetVideosInfoResult{}, nil
	}

	if repository.videoService == nil {
		return nil, errors.New("video metadata service is nil")
	}

	metadata, err := repository.videoService.GetByIDs(requestContext, videoIDs)
	if err != nil {
		return nil, err
	}

	results := make([]GetVideosInfoResult, 0, len(metadata))
	for _, video := range metadata {
		results = append(results, GetVideosInfoResult{
			ID:        video.ID,
			Title:     video.Title,
			Channel:   video.Channel,
			Duration:  video.Duration,
			Thumbnail: video.Thumbnail,
		})
	}

	return results, nil
}

func (repository *Repository) PostLikedVideo(requestContext context.Context, userID uuid.UUID, videoID string) error {
	if repository.db == nil {
		return errors.New("database connection is nil")
	}

	_, err := repository.db.Exec(requestContext, `
	INSERT INTO liked (user_id, id, created_at)
	VALUES ($1, $2, NOW())
	ON CONFLICT (user_id, id) DO NOTHING
	`, userID, videoID)
	if err != nil {
		return err
	}
	return nil
}
