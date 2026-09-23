package videos

import (
	"context"
	"fmt"
)

type Service struct {
	repository Repository
}

func NewService(repository Repository) *Service {
	return &Service{repository: repository}
}

func (service *Service) GetByIDs(ctx context.Context, ids []string) ([]Video, error) {
	if len(ids) == 0 {
		return []Video{}, nil
	}

	videos, err := service.repository.GetByIDs(ctx, ids)
	if err != nil {
		return nil, fmt.Errorf("get video metadata: %w", err)
	}
	return videos, nil
}

func (service *Service) Save(ctx context.Context, videos []Video) error {
	if err := service.repository.UpsertMany(ctx, videos); err != nil {
		return fmt.Errorf("save video metadata: %w", err)
	}
	return nil
}
