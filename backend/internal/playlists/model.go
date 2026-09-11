package playlists

// Thumbnail struct matching yt-dlp JSON schema
type Thumbnail struct {
	URL    string `json:"url"`
	Height int    `json:"height"`
	Width  int    `json:"width"`
}

// PlaylistResponse represents the top-level output from yt-dlp search
type PlaylistResponse struct {
	Entries []PlaylistInfo `json:"entries"`
}

// PlaylistInfo contains the metadata for extracted playlists
type PlaylistInfo struct {
	ID         string      `json:"id"`
	Title      string      `json:"title"`
	URL        string      `json:"url"`
	Uploader   string      `json:"uploader"`
	Channel    string      `json:"channel"`
	VideoCount int         `json:"playlist_count"`
	Thumbnails []Thumbnail `json:"thumbnails"`
	Thumbnail  string      `json:"thumbnail"`
}

// PopularPlaylistsResponse is the JSON envelope for the popular-playlists endpoint
type PopularPlaylistsResponse struct {
	Results []PlaylistInfo `json:"results"`
	Count   int            `json:"count"`
}

// PlaylistTrack represents a single track inside a playlist
type PlaylistTrack struct {
	ID              string      `json:"id"`
	Title           string      `json:"title"`
	Channel         string      `json:"channel"`
	URL             string      `json:"url"`
	Thumbnail       string      `json:"thumbnail"`
	DurationSeconds int         `json:"durationSeconds"`
	Duration        string      `json:"duration"`
	Thumbnails      []Thumbnail `json:"thumbnails"`
}

// PlaylistTracksResponse is the JSON envelope for the playlist-tracks endpoint
type PlaylistTracksResponse struct {
	Tracks []PlaylistTrack `json:"tracks"`
	Count  int             `json:"count"`
}

// PlaylistDetails maps the single JSON object returned by yt-dlp for a playlist
type PlaylistDetails struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Uploader    string `json:"uploader"`
	Channel     string `json:"channel"`
	ChannelID   string `json:"channel_id"`
	WebpageURL  string `json:"webpage_url"`
	TrackCount  int    `json:"playlist_count"`
	Thumbnails  []struct {
		URL    string `json:"url"`
		Width  int    `json:"width"`
		Height int    `json:"height"`
	} `json:"thumbnails"`
}
