package playlists_test

import (
	"context"
	"testing"

	"backend/internal/playlists"
	"backend/internal/testutils"
)

func TestFetchPopularParsesPlaylistsAndBuildsMissingURLs(t *testing.T) {
	testutils.InstallExecutable(t, "yt-dlp", `#!/bin/sh
printf '%s\n' \
  '{"id":"playlist-one","title":"One"}' \
  '{"id":"playlist-two","title":"Two","url":"https://example.test/two"}' \
  '{"id":"playlist-three"}' \
  'invalid-json'
`)

	items, err := playlists.NewRepository(nil).FetchPopular()
	if err != nil {
		t.Fatalf("FetchPopular() error = %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("FetchPopular() = %#v, want two titled playlists", items)
	}
	if items[0].URL != "https://www.youtube.com/playlist?list=playlist-one" {
		t.Errorf("generated URL = %q", items[0].URL)
	}
	if items[1].URL != "https://example.test/two" {
		t.Errorf("existing URL = %q", items[1].URL)
	}
}

func TestFetchDetailsDecodesPlaylistMetadata(t *testing.T) {
	testutils.InstallExecutable(t, "yt-dlp", `#!/bin/sh
printf '%s\n' '{"id":"playlist-one","title":"A mix","playlist_count":7,"channel":"Channel"}'
`)

	details, err := playlists.NewRepository(nil).FetchDetails("https://example.test/playlist")
	if err != nil {
		t.Fatalf("FetchDetails() error = %v", err)
	}
	if details.Title != "A mix" || details.TrackCount != 7 || details.Channel != "Channel" {
		t.Errorf("details = %#v", details)
	}
}

func TestFetchTracksAppliesPaginationAndParsesDurations(t *testing.T) {
	testutils.InstallExecutable(t, "yt-dlp", `#!/bin/sh
case "$*" in
  *"--playlist-start 3"*"--playlist-end 4"*) ;;
  *) exit 9 ;;
esac
printf '%s\n' \
  '{"id":"track-one","title":"First","duration":"123"}' \
  '{"id":"track-two","title":"Second","duration":45.8}' \
  '{"id":"track-three"}'
`)

	tracks, err := playlists.NewRepository(nil).FetchTracks(context.Background(), "playlist-one", 3, 2)
	if err != nil {
		t.Fatalf("FetchTracks() error = %v", err)
	}
	if len(tracks) != 2 || tracks[0].Duration != 123 || tracks[1].Duration != 45 {
		t.Fatalf("tracks = %#v", tracks)
	}
}
