package videos

import (
	"context"
	"fmt"
)

type Video struct {
	ID              string `json:"id"`
	Title           string `json:"title"`
	Channel         string `json:"channel"`
	DurationSeconds int    `json:"durationSeconds"`
	Thumbnail       string `json:"thumbnail"`
	URL             string `json:"url"`
}

type Repository interface {
	GetByIDs(ctx context.Context, ids []string) ([]Video, error)
	UpsertMany(ctx context.Context, videos []Video) error
}

func (video Video) WithDerivedFields() Video {
	video.URL = fmt.Sprintf("https://www.youtube.com/watch?v=%s", video.ID)
	video.Thumbnail = fmt.Sprintf("https://i.ytimg.com/vi/%s/hqdefault.jpg", video.ID)
	return video
}
