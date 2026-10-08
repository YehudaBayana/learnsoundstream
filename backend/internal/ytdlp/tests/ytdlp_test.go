package ytdlp_test

import (
	"testing"

	"backend/internal/testutils"
	"backend/internal/ytdlp"
)

func TestResolvePathPrefersExecutableOnPath(t *testing.T) {
	want := testutils.InstallExecutable(t, "yt-dlp", "#!/bin/sh\nexit 0\n")
	if got := ytdlp.ResolvePath(); got != want {
		t.Fatalf("ResolvePath() = %q, want %q", got, want)
	}
}
