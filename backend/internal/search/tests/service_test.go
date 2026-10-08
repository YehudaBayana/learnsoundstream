package search_test

import (
	"context"
	"testing"

	"backend/internal/search"
	"backend/internal/testutils"
)

func TestSearchParsesAndNormalizesYtDlpResults(t *testing.T) {
	testutils.InstallExecutable(t, "yt-dlp", `#!/bin/sh
printf '%s\n' \
  '{"id":"video-one","title":"First track","uploader":"Uploader","duration":"125"}' \
  '{"id":"video-two","title":"Second track","channel":"Channel","duration":42.8}' \
  '{"title":"Entry without an ID"}' \
  'not-json'
`)

	service := search.NewService(nil)
	results, err := service.Search(context.Background(), "ambient")
	if err != nil {
		t.Fatalf("Search() error = %v", err)
	}
	if len(results) != 2 {
		t.Fatalf("Search() returned %d results, want 2: %#v", len(results), results)
	}
	if results[0].Channel != "Uploader" || results[0].Duration != 125 {
		t.Errorf("first result fallback/duration = %#v", results[0])
	}
	if results[1].Channel != "Channel" || results[1].Duration != 42 {
		t.Errorf("second result channel/duration = %#v", results[1])
	}
	if results[0].Thumbnail != "https://i.ytimg.com/vi/video-one/hqdefault.jpg" {
		t.Errorf("thumbnail = %q", results[0].Thumbnail)
	}
}
