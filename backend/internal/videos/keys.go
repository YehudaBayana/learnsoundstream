package videos

import (
	"fmt"

	"github.com/google/uuid"
)

// Storage keys are built only from server-generated ids, never from user-supplied paths.

func originalKey(ownerID, videoID uuid.UUID, extension string) string {
	return fmt.Sprintf("%s/%s/original%s", ownerID, videoID, extension)
}

func playbackKey(ownerID, videoID uuid.UUID) string {
	return fmt.Sprintf("%s/%s/playback.mp4", ownerID, videoID)
}

func thumbnailKey(ownerID, videoID uuid.UUID) string {
	return fmt.Sprintf("%s/%s/thumb.jpg", ownerID, videoID)
}
