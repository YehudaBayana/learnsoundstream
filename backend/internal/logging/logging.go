// Package logging configures slog output and the Sentry error pipeline. See docs/LOGGING.md.
package logging

import (
	"fmt"
	"log/slog"
	"os"

	"backend/internal/config"

	"github.com/getsentry/sentry-go"
)

// Setup installs the default slog logger and returns a function that flushes pending Sentry events.
// Production writes JSON (parsed by Alloy for Loki); other environments write readable text.
func Setup(cfg config.Config) (flush func(), err error) {
	var base slog.Handler
	if cfg.Env == "production" {
		base = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})
	} else {
		base = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug})
	}

	if cfg.SentryDSN == "" {
		slog.SetDefault(slog.New(base))
		return func() {}, nil
	}

	if err := sentry.Init(sentry.ClientOptions{
		Dsn:         cfg.SentryDSN,
		Environment: cfg.Env,
	}); err != nil {
		slog.SetDefault(slog.New(base))
		return func() {}, fmt.Errorf("initialize sentry: %w", err)
	}

	slog.SetDefault(slog.New(newSentryHandler(base)))
	return func() { sentry.Flush(config.SentryFlushTimeout) }, nil
}
