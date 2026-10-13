package storage

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

// R2Config holds the Cloudflare R2 credentials and bucket; Endpoint overrides the default account endpoint.
type R2Config struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	Endpoint        string
}

// R2Storage implements Storage on Cloudflare R2 through its S3-compatible API.
type R2Storage struct {
	bucket    string
	client    *s3.Client
	presigner *s3.PresignClient
	uploader  *manager.Uploader
}

func NewR2Storage(cfg R2Config) (*R2Storage, error) {
	if cfg.Bucket == "" || cfg.AccessKeyID == "" || cfg.SecretAccessKey == "" {
		return nil, errors.New("R2_BUCKET, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY are required")
	}
	endpoint := cfg.Endpoint
	if endpoint == "" {
		if cfg.AccountID == "" {
			return nil, errors.New("R2_ACCOUNT_ID or R2_ENDPOINT is required")
		}
		endpoint = fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.AccountID)
	}

	client := s3.New(s3.Options{
		Region:       "auto",
		BaseEndpoint: aws.String(endpoint),
		Credentials:  credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
		UsePathStyle: true,
		// R2 rejects the optional trailing checksums newer SDK versions add by default.
		RequestChecksumCalculation: aws.RequestChecksumCalculationWhenRequired,
		ResponseChecksumValidation: aws.ResponseChecksumValidationWhenRequired,
	})
	return &R2Storage{
		bucket:    cfg.Bucket,
		client:    client,
		presigner: s3.NewPresignClient(client),
		uploader:  manager.NewUploader(client),
	}, nil
}

func (store *R2Storage) CreateMultipartUpload(ctx context.Context, key, contentType string) (string, error) {
	output, err := store.client.CreateMultipartUpload(ctx, &s3.CreateMultipartUploadInput{
		Bucket:      aws.String(store.bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", fmt.Errorf("create multipart upload: %w", err)
	}
	return aws.ToString(output.UploadId), nil
}

func (store *R2Storage) PresignUploadPart(ctx context.Context, key, uploadID string, partNumber int, ttl time.Duration) (string, error) {
	request, err := store.presigner.PresignUploadPart(ctx, &s3.UploadPartInput{
		Bucket:     aws.String(store.bucket),
		Key:        aws.String(key),
		UploadId:   aws.String(uploadID),
		PartNumber: aws.Int32(int32(partNumber)),
	}, s3.WithPresignExpires(ttl))
	if err != nil {
		return "", fmt.Errorf("presign upload part: %w", err)
	}
	return request.URL, nil
}

func (store *R2Storage) CompleteMultipartUpload(ctx context.Context, key, uploadID string, parts []CompletedPart) error {
	completedParts := make([]types.CompletedPart, 0, len(parts))
	for _, part := range parts {
		completedParts = append(completedParts, types.CompletedPart{
			PartNumber: aws.Int32(int32(part.PartNumber)),
			ETag:       aws.String(part.ETag),
		})
	}
	_, err := store.client.CompleteMultipartUpload(ctx, &s3.CompleteMultipartUploadInput{
		Bucket:          aws.String(store.bucket),
		Key:             aws.String(key),
		UploadId:        aws.String(uploadID),
		MultipartUpload: &types.CompletedMultipartUpload{Parts: completedParts},
	})
	if err != nil {
		return fmt.Errorf("complete multipart upload: %w", err)
	}
	return nil
}

func (store *R2Storage) AbortMultipartUpload(ctx context.Context, key, uploadID string) error {
	_, err := store.client.AbortMultipartUpload(ctx, &s3.AbortMultipartUploadInput{
		Bucket:   aws.String(store.bucket),
		Key:      aws.String(key),
		UploadId: aws.String(uploadID),
	})
	var noSuchUpload *types.NoSuchUpload
	if err != nil && !errors.As(err, &noSuchUpload) {
		return fmt.Errorf("abort multipart upload: %w", err)
	}
	return nil
}

func (store *R2Storage) PresignGet(ctx context.Context, key, contentType string, ttl time.Duration) (string, error) {
	request, err := store.presigner.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket:                     aws.String(store.bucket),
		Key:                        aws.String(key),
		ResponseContentType:        aws.String(contentType),
		ResponseCacheControl:       aws.String("private"),
		ResponseContentDisposition: aws.String("inline"),
	}, s3.WithPresignExpires(ttl))
	if err != nil {
		return "", fmt.Errorf("presign get object: %w", err)
	}
	return request.URL, nil
}

func (store *R2Storage) Size(ctx context.Context, key string) (int64, error) {
	output, err := store.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(store.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		var notFound *types.NotFound
		if errors.As(err, &notFound) {
			return 0, ErrNotFound
		}
		return 0, fmt.Errorf("head object: %w", err)
	}
	return aws.ToInt64(output.ContentLength), nil
}

// Download streams the object to destinationPath without holding it in memory.
func (store *R2Storage) Download(ctx context.Context, key, destinationPath string) error {
	output, err := store.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(store.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		var noSuchKey *types.NoSuchKey
		if errors.As(err, &noSuchKey) {
			return ErrNotFound
		}
		return fmt.Errorf("get object: %w", err)
	}
	defer output.Body.Close()

	file, err := os.Create(destinationPath)
	if err != nil {
		return fmt.Errorf("create download file: %w", err)
	}
	if _, err := io.Copy(file, output.Body); err != nil {
		_ = file.Close()
		return fmt.Errorf("copy object to file: %w", err)
	}
	return file.Close()
}

// UploadFile uses multipart upload under the hood, so files over 5 GiB work.
func (store *R2Storage) UploadFile(ctx context.Context, key, sourcePath, contentType string) error {
	file, err := os.Open(sourcePath)
	if err != nil {
		return fmt.Errorf("open upload file: %w", err)
	}
	defer file.Close()

	_, err = store.uploader.Upload(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(store.bucket),
		Key:         aws.String(key),
		Body:        file,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return fmt.Errorf("upload object: %w", err)
	}
	return nil
}

func (store *R2Storage) Delete(ctx context.Context, key string) error {
	_, err := store.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(store.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("delete object: %w", err)
	}
	return nil
}
