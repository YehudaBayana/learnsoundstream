package videos

import (
	"context"
	"time"
)

const uploadJanitorInterval = time.Hour

// StartUploadJanitor discards abandoned uploads once at start-up and then hourly until ctx is cancelled.
func StartUploadJanitor(ctx context.Context, service *Service) {
	go func() {
		ticker := time.NewTicker(uploadJanitorInterval)
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
