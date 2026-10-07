package history

import (
	"context"
	"errors"

	"backend/internal/videos"

	"github.com/google/uuid"
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

func (repository *Repository) GetPlaybackHistory(requestContext context.Context, userId uuid.UUID, limit int, offset int) ([]GetVideosInfoResult, error) {
	if repository.db == nil {
		return nil, errors.New("database connection is nil")
	}
	if userId == uuid.Nil {
		return nil, errors.New("user ID is nil")
	}
	if limit <= 0 {
		return nil, errors.New("limit must be greater than 0")
	}
	if offset < 0 {
		return nil, errors.New("offset cannot be negative")
	}
	rows, err := repository.db.Query(requestContext, `
    SELECT user_id, id, play_count, last_played_at
    FROM playback_history
    WHERE user_id = $1
    ORDER BY last_played_at DESC
	LIMIT $2 OFFSET $3
    `, userId, limit, offset)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var videoIDs []string
	for rows.Next() {
		var item PlaybackHistory
		if err := rows.Scan(&item.UserID, &item.ID, &item.PlayCount, &item.LastPlayedAt); err != nil {
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
