package handlers

import (
	"os"
	"os/exec"
)

// resolveYtDlpPath finds the absolute path to the yt-dlp binary.
// It first checks the system PATH via exec.LookPath, then falls back
// to typical installation directories (Homebrew on Apple Silicon, then Intel Mac / Linux).
func resolveYtDlpPath() string {
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
