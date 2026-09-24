package history

import "time"

type PlaybackHistory struct {
	UserID       string    `json:"user_id"`
	ID           string    `json:"id"`
	PlayCount    int       `json:"play_count"`
	LastPlayedAt time.Time `json:"last_played_at"`
}

type ytDlpEntry struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Channel  string `json:"channel"`
	Uploader string `json:"uploader"`
	Duration int    `json:"duration"`
}

type GetVideosInfoResult struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Channel   string `json:"channel"`
	Duration  int    `json:"duration"`
	Thumbnail string `json:"thumbnail"`
}
