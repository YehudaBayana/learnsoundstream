package history

import "time"

type PlaybackHistory struct {
	UserID       string `json:"user_id"`
	VideoID      string `json:"video_id"`
	PlayCount    int    `json:"play_count"`
	LastPlayedAt time.Time `json:"last_played_at"`
}
