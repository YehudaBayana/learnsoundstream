package ytdlp

import (
	"os"
	"os/exec"
)

// ResolvePath finds the absolute path to the yt-dlp binary.
// It first checks the system PATH via exec.LookPath, then falls back
// to typical installation directories (Homebrew on Apple Silicon, then Intel Mac / Linux).
func ResolvePath() string {
	if p, err := exec.LookPath("yt-dlp"); err == nil {
		return p
	}
	if _, err := os.Stat("/opt/homebrew/bin/yt-dlp"); err == nil {
		return "/opt/homebrew/bin/yt-dlp"
	}
	if _, err := os.Stat("/usr/local/bin/yt-dlp"); err == nil {
		return "/usr/local/bin/yt-dlp"
	}
	// Fall back to bare name — exec will search PATH at runtime
	return "yt-dlp"
}

// splitString splits s by sep (avoids importing strings in this file).
func splitString(s, sep string) []string {
	var parts []string
	start := 0
	for i := 0; i <= len(s)-len(sep); i++ {
		if s[i:i+len(sep)] == sep {
			parts = append(parts, s[start:i])
			start = i + len(sep)
		}
	}
	parts = append(parts, s[start:])
	return parts
}

// atoi converts a string to int, returning 0 on error.
func atoi(s string) int {
	n := 0
	for _, c := range s {
		if c < '0' || c > '9' {
			return 0
		}
		n = n*10 + int(c-'0')
	}
	return n
}
