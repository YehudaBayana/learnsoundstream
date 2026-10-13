package videos

import (
	"backend/internal/config"
	"fmt"

	"backend/internal/storage"
)

func partCount(sizeBytes int64) int {
	return int((sizeBytes + config.UploadPartBytes - 1) / config.UploadPartBytes)
}

// validatePartNumbers accepts 1..count without duplicates, at most config.MaxPresignedPartsPerRequest at a time.
func validatePartNumbers(partNumbers []int, count int) error {
	if len(partNumbers) == 0 || len(partNumbers) > config.MaxPresignedPartsPerRequest {
		return fmt.Errorf("%w: request between 1 and %d parts", ErrInvalidInput, config.MaxPresignedPartsPerRequest)
	}
	seen := make(map[int]bool, len(partNumbers))
	for _, partNumber := range partNumbers {
		if partNumber < 1 || partNumber > count || seen[partNumber] {
			return fmt.Errorf("%w: invalid part number %d", ErrInvalidInput, partNumber)
		}
		seen[partNumber] = true
	}
	return nil
}

// validateCompletedParts requires every part 1..count exactly once, in order, with an ETag.
func validateCompletedParts(parts []storage.CompletedPart, count int) error {
	if len(parts) != count {
		return fmt.Errorf("%w: expected %d parts, got %d", ErrInvalidUpload, count, len(parts))
	}
	for index, part := range parts {
		if part.PartNumber != index+1 || part.ETag == "" {
			return fmt.Errorf("%w: part %d is missing or out of order", ErrInvalidUpload, index+1)
		}
	}
	return nil
}
