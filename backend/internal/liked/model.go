package liked

import "time"

type Liked struct {
	UserID    string    `json:"user_id"`
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
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
