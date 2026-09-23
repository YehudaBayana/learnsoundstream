package history

import "time"

type PlaybackHistory struct {
	UserID       string `json:"user_id"`
	VideoID      string `json:"video_id"`
	PlayCount    int    `json:"play_count"`
	LastPlayedAt time.Time `json:"last_played_at"`
}

type ytDlpEntry struct {
	ID       string  `json:"id"`
	Title    string  `json:"title"`
	Channel  string  `json:"channel"`
	Uploader string  `json:"uploader"`
	Duration float64 `json:"duration"`
}


type GetVideosInfoResult struct {
	VideoID         string `json:"videoId"`
	Title           string `json:"title"`
	Channel         string `json:"channel"`
	Duration        string `json:"duration"`
	DurationSeconds int    `json:"durationSeconds"`
	Thumbnail       string `json:"thumbnail"`
}
