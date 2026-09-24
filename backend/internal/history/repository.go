package history

import (
	"context"
	"database/sql"
	"errors"

	"backend/internal/videos"
)

type Repository struct {
	db           *sql.DB
	videoService *videos.Service
}

func NewRepository(db *sql.DB, videoService *videos.Service) *Repository {
	return &Repository{
		db:           db,
		videoService: videoService,
	}
}

func (repository *Repository) GetPlaybackHistory(userID string, requestContext context.Context) ([]GetVideosInfoResult, error) {
	if repository.db == nil {
		return nil, errors.New("database connection is nil")
	}

	rows, err := repository.db.Query(`
    SELECT user_id, id, play_count, last_played_at
    FROM playback_history
    WHERE user_id = $1
    ORDER BY last_played_at DESC
	LIMIT 5 OFFSET 0
    `, userID)

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
