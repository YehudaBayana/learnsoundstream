package history

import (
	"database/sql"
	"errors"
)

type Repository struct {
	db *sql.DB;
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db:db}
}

func (repository *Repository) GetPlaybackHistory(userID string) ([]PlaybackHistory, error) {
	if repository.db == nil {
        return nil, errors.New("database connection is nil")
    }
	
	rows, err := repository.db.Query(`
	SELECT user_id, video_id, play_count, last_played_at
	FROM playback_history
	WHERE user_id = $1
	ORDER BY last_played_at DESC
	`, userID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []PlaybackHistory
	for rows.Next() {
		var item PlaybackHistory
		if err := rows.Scan(&item.UserID, &item.VideoID, &item.PlayCount, &item.LastPlayedAt); err != nil{
			return nil, err
		}
		items = append(items, item);
	}
	return items, nil
}