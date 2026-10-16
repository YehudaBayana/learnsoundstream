package logging

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/getsentry/sentry-go"
)

// sentryHandler forwards every record to the wrapped handler and reports Error-level records to Sentry.
type sentryHandler struct {
	next  slog.Handler
	attrs []slog.Attr
}

func newSentryHandler(next slog.Handler) *sentryHandler {
	return &sentryHandler{next: next}
}

func (handler *sentryHandler) Enabled(ctx context.Context, level slog.Level) bool {
	return handler.next.Enabled(ctx, level)
}

func (handler *sentryHandler) Handle(ctx context.Context, record slog.Record) error {
	if record.Level >= slog.LevelError {
		handler.report(record)
	}
	return handler.next.Handle(ctx, record)
}

func (handler *sentryHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	combined := append(append([]slog.Attr{}, handler.attrs...), attrs...)
	return &sentryHandler{next: handler.next.WithAttrs(attrs), attrs: combined}
}

func (handler *sentryHandler) WithGroup(name string) slog.Handler {
	return &sentryHandler{next: handler.next.WithGroup(name), attrs: handler.attrs}
}

func (handler *sentryHandler) report(record slog.Record) {
	var cause error
	tags := make(map[string]string)

	collect := func(attr slog.Attr) bool {
		if attr.Key == "error" {
			if err, ok := attr.Value.Any().(error); ok {
				cause = err
				return true
			}
		}
		tags[attr.Key] = attr.Value.String()
		return true
	}
	for _, attr := range handler.attrs {
		collect(attr)
	}
	record.Attrs(collect)

	sentry.WithScope(func(scope *sentry.Scope) {
		scope.SetTags(tags)
		if cause != nil {
			// Group by message so one failing code path is one Sentry issue.
			scope.SetFingerprint([]string{record.Message})
			sentry.CaptureException(fmt.Errorf("%s: %w", record.Message, cause))
			return
		}
		sentry.CaptureMessage(record.Message)
	})
}
