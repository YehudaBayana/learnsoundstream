package videos

import (
	"fmt"

	"backend/internal/storage"
)

const (
	// 64 MiB parts keep a 20 GiB file at 320 parts, far below the 10,000-part limit; R2 needs equal sizes except the last.
	uploadPartSize              int64 = 64 << 20
	maxPresignedPartsPerRequest       = 100
)

func partCount(sizeBytes int64) int {
	return int((sizeBytes + uploadPartSize - 1) / uploadPartSize)
}

// validatePartNumbers accepts 1..count without duplicates, at most maxPresignedPartsPerRequest at a time.
func validatePartNumbers(partNumbers []int, count int) error {
	if len(partNumbers) == 0 || len(partNumbers) > maxPresignedPartsPerRequest {
		return fmt.Errorf("%w: request between 1 and %d parts", ErrInvalidInput, maxPresignedPartsPerRequest)
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
