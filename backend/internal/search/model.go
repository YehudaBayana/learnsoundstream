package search

// SearchResult represents a single YouTube search result returned to the client
type SearchResult struct {
	Id       		string `json:"id"`
	Title           string `json:"title"`
	Channel         string `json:"channel"`
	Duration        string `json:"duration"`
	DurationSeconds int    `json:"durationSeconds"`
	Thumbnail       string `json:"thumbnail"`
}

// SearchResponse is the top-level JSON envelope for the search endpoint
type SearchResponse struct {
	Results []SearchResult `json:"results"`
	Query   string         `json:"query"`
	Count   int            `json:"count"`
}

// ytDlpEntry represents the subset of fields we care about from yt-dlp's JSON output.
// yt-dlp emits many more fields — we only unmarshal what we need.
type ytDlpEntry struct {
	ID       string  `json:"id"`
	Title    string  `json:"title"`
	Channel  string  `json:"channel"`
	Uploader string  `json:"uploader"`
	Duration float64 `json:"duration"`
}
