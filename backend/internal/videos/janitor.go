package videos

import (
	"backend/internal/config"
	"context"
	"time"
)

// StartUploadJanitor discards abandoned uploads once at start-up and then hourly until ctx is cancelled.
func StartUploadJanitor(ctx context.Context, service *Service) {
	go func() {
		ticker := time.NewTicker(config.UploadJanitorInterval)
		defer ticker.Stop()
		for {
			service.CleanupExpiredUploads(ctx)
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
			}
		}
	}()
}
