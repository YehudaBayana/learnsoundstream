package videos_test

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"backend/internal/storage"
	"backend/internal/videos"

	"github.com/google/uuid"
)

const partSize = 64 << 20

var testSettings = videos.Settings{MaxUploadBytes: 1 << 30, UploadURLTTL: time.Hour, PlaybackURLTTL: time.Hour}

// repositoryStub implements only what the tests exercise; other methods panic via the nil embedded interface.
type repositoryStub struct {
	videos.Repository

	video          videos.Video
	err            error
	created        videos.NewVideo
	deleted        bool
	markedSize     int64
	gotVideoIDs    []uuid.UUID
	getByIDsCalled bool
}

func (stub *repositoryStub) Create(_ context.Context, newVideo videos.NewVideo) (videos.Video, error) {
	stub.created = newVideo
	return stub.video, stub.err
}

func (stub *repositoryStub) GetByID(context.Context, uuid.UUID, uuid.UUID) (videos.Video, error) {
	return stub.video, stub.err
}

func (stub *repositoryStub) GetByIDs(_ context.Context, _ uuid.UUID, videoIDs []uuid.UUID) ([]videos.Video, error) {
	stub.getByIDsCalled = true
	stub.gotVideoIDs = videoIDs
	return []videos.Video{stub.video}, stub.err
}

func (stub *repositoryStub) Delete(context.Context, uuid.UUID, uuid.UUID) (videos.Video, error) {
	stub.deleted = true
	return stub.video, stub.err
}

func (stub *repositoryStub) MarkProcessing(_ context.Context, _, _ uuid.UUID, sizeBytes int64) (videos.Video, error) {
	stub.markedSize = sizeBytes
	processing := stub.video
	processing.Status = videos.StatusProcessing
	return processing, stub.err
}

func TestGetByIDsSkipsRepositoryForEmptyRequest(t *testing.T) {
	repository := &repositoryStub{}
	service := videos.NewService(repository, storage.NewMemoryStorage(), testSettings)

	got, err := service.GetByIDs(context.Background(), uuid.New(), nil)
	if err != nil {
		t.Fatalf("GetByIDs() error = %v", err)
	}
	if got == nil || len(got) != 0 {
		t.Fatalf("GetByIDs() = %#v, want empty non-nil slice", got)
	}
	if repository.getByIDsCalled {
		t.Error("repository was called for an empty request")
	}
}

func TestGetWrapsRepositoryErrorAndKeepsNotFound(t *testing.T) {
	repository := &repositoryStub{err: videos.ErrNotFound}
	service := videos.NewService(repository, storage.NewMemoryStorage(), testSettings)

	_, err := service.Get(context.Background(), uuid.New(), uuid.New())
	if !errors.Is(err, videos.ErrNotFound) {
		t.Fatalf("Get() error = %v, want ErrNotFound", err)
	}
	if !strings.Contains(err.Error(), "get video") {
		t.Errorf("Get() error = %q, want it wrapped with context", err)
	}
}

func TestDeleteRemovesAllStoredFiles(t *testing.T) {
	keys := []string{"owner/video/original.mov", "owner/video/playback.mp4", "owner/video/thumb.jpg"}
	store := storage.NewMemoryStorage()
	for _, key := range keys {
		store.PutObject(key, []byte("data"))
	}
	repository := &repositoryStub{video: videos.Video{OriginalKey: keys[0], PlaybackKey: keys[1], ThumbnailKey: keys[2]}}
	service := videos.NewService(repository, store, testSettings)

	if err := service.Delete(context.Background(), uuid.New(), uuid.New()); err != nil {
		t.Fatalf("Delete() error = %v", err)
	}
	for _, key := range keys {
		if store.HasObject(key) {
			t.Errorf("object %q still exists after Delete()", key)
		}
	}
}

func TestDeleteAbortsUnfinishedUpload(t *testing.T) {
	store := storage.NewMemoryStorage()
	uploadID, err := store.CreateMultipartUpload(context.Background(), "owner/video/original.mp4", "video/mp4")
	if err != nil {
		t.Fatalf("CreateMultipartUpload() error = %v", err)
	}
	repository := &repositoryStub{video: videos.Video{OriginalKey: "owner/video/original.mp4", UploadID: uploadID}}
	service := videos.NewService(repository, store, testSettings)

	if err := service.Delete(context.Background(), uuid.New(), uuid.New()); err != nil {
		t.Fatalf("Delete() error = %v", err)
	}
	if store.OpenUploads() != 0 {
		t.Error("multipart upload still open after Delete()")
	}
}

func TestPlaybackURLRequiresReadyVideo(t *testing.T) {
	repository := &repositoryStub{video: videos.Video{Status: videos.StatusProcessing}}
	service := videos.NewService(repository, storage.NewMemoryStorage(), testSettings)

	_, err := service.PlaybackURL(context.Background(), uuid.New(), uuid.New())
	if !errors.Is(err, videos.ErrNotReady) {
		t.Fatalf("PlaybackURL() error = %v, want ErrNotReady", err)
	}
}

func TestPlaybackURLSignsPlaybackKeyOfReadyVideo(t *testing.T) {
	repository := &repositoryStub{video: videos.Video{Status: videos.StatusReady, PlaybackKey: "owner/video/playback.mp4"}}
	service := videos.NewService(repository, storage.NewMemoryStorage(), testSettings)

	signed, err := service.PlaybackURL(context.Background(), uuid.New(), uuid.New())
	if err != nil {
		t.Fatalf("PlaybackURL() error = %v", err)
	}
	if !strings.Contains(signed.URL, "owner/video/playback.mp4") || !signed.ExpiresAt.After(time.Now()) {
		t.Errorf("PlaybackURL() = %+v", signed)
	}
}

func TestInitUploadValidatesDeclaredFile(t *testing.T) {
	tests := []struct {
		name  string
		input videos.InitUpload
		want  error
	}{
		{"unsupported extension", videos.InitUpload{Filename: "notes.txt", SizeBytes: 10}, videos.ErrUnsupportedFormat},
		{"empty file", videos.InitUpload{Filename: "dance.mov", SizeBytes: 0}, videos.ErrInvalidInput},
		{"too large", videos.InitUpload{Filename: "dance.mov", SizeBytes: testSettings.MaxUploadBytes + 1}, videos.ErrUploadTooLarge},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			store := storage.NewMemoryStorage()
			service := videos.NewService(&repositoryStub{}, store, testSettings)

			_, err := service.InitUpload(context.Background(), uuid.New(), test.input)
			if !errors.Is(err, test.want) {
				t.Fatalf("InitUpload() error = %v, want %v", err, test.want)
			}
			if store.OpenUploads() != 0 {
				t.Error("rejected upload still opened a multipart upload")
			}
		})
	}
}

func TestInitUploadComputesPartCountAndStoresPendingVideo(t *testing.T) {
	repository := &repositoryStub{video: videos.Video{SizeBytes: 2*partSize + 1}}
	service := videos.NewService(repository, storage.NewMemoryStorage(), testSettings)

	session, err := service.InitUpload(context.Background(), uuid.New(), videos.InitUpload{Filename: "Dance.MOV", SizeBytes: 2*partSize + 1, Title: "Dance"})
	if err != nil {
		t.Fatalf("InitUpload() error = %v", err)
	}
	if session.PartCount != 3 || session.PartSize != partSize {
		t.Errorf("session = %+v, want 3 parts of %d bytes", session, partSize)
	}
	if repository.created.Status != videos.StatusUploading || repository.created.UploadID == "" || repository.created.UploadExpiresAt == nil {
		t.Errorf("created = %+v, want an uploading row with an upload id and expiry", repository.created)
	}
	if !strings.HasSuffix(repository.created.OriginalKey, "/original.mov") {
		t.Errorf("OriginalKey = %q, want a lowercase extension", repository.created.OriginalKey)
	}
}

func TestInitUploadAbortsMultipartUploadWhenInsertFails(t *testing.T) {
	store := storage.NewMemoryStorage()
	service := videos.NewService(&repositoryStub{err: errors.New("database unavailable")}, store, testSettings)

	if _, err := service.InitUpload(context.Background(), uuid.New(), videos.InitUpload{Filename: "dance.mp4", SizeBytes: 10}); err == nil {
		t.Fatal("InitUpload() error = nil, want the repository error")
	}
	if store.OpenUploads() != 0 {
		t.Error("multipart upload left open after a failed insert")
	}
}

func TestPresignPartsRejectsInvalidRequests(t *testing.T) {
	uploading := videos.Video{Status: videos.StatusUploading, SizeBytes: partSize + 1, OriginalKey: "k", UploadID: "u"}
	tests := []struct {
		name    string
		video   videos.Video
		numbers []int
		want    error
	}{
		{"part zero", uploading, []int{0}, videos.ErrInvalidInput},
		{"part past the end", uploading, []int{3}, videos.ErrInvalidInput},
		{"duplicate part", uploading, []int{1, 1}, videos.ErrInvalidInput},
		{"no parts", uploading, nil, videos.ErrInvalidInput},
		{"upload already finished", videos.Video{Status: videos.StatusProcessing, SizeBytes: 10}, []int{1}, videos.ErrInvalidUpload},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			service := videos.NewService(&repositoryStub{video: test.video}, storage.NewMemoryStorage(), testSettings)

			_, err := service.PresignParts(context.Background(), uuid.New(), uuid.New(), test.numbers)
			if !errors.Is(err, test.want) {
				t.Fatalf("PresignParts() error = %v, want %v", err, test.want)
			}
		})
	}
}

func TestPresignPartsReturnsOneURLPerPart(t *testing.T) {
	repository := &repositoryStub{video: videos.Video{Status: videos.StatusUploading, SizeBytes: partSize + 1, OriginalKey: "k", UploadID: "u"}}
	service := videos.NewService(repository, storage.NewMemoryStorage(), testSettings)

	urls, err := service.PresignParts(context.Background(), uuid.New(), uuid.New(), []int{1, 2})
	if err != nil {
		t.Fatalf("PresignParts() error = %v", err)
	}
	if len(urls) != 2 || urls[0].PartNumber != 1 || urls[1].PartNumber != 2 || urls[0].URL == urls[1].URL {
		t.Errorf("PresignParts() = %+v", urls)
	}
}

func uploadedVideo(t *testing.T, store *storage.MemoryStorage, declaredSize int, partContents ...string) videos.Video {
	t.Helper()
	const key = "owner/video/original.mp4"
	uploadID, err := store.CreateMultipartUpload(context.Background(), key, "video/mp4")
	if err != nil {
		t.Fatalf("CreateMultipartUpload() error = %v", err)
	}
	for index, content := range partContents {
		store.PutPart(uploadID, index+1, []byte(content))
	}
	return videos.Video{Status: videos.StatusUploading, SizeBytes: int64(declaredSize), OriginalKey: key, UploadID: uploadID}
}

func TestCompleteUploadMovesVideoToProcessing(t *testing.T) {
	store := storage.NewMemoryStorage()
	repository := &repositoryStub{video: uploadedVideo(t, store, 5, "hello")}
	service := videos.NewService(repository, store, testSettings)

	video, err := service.CompleteUpload(context.Background(), uuid.New(), uuid.New(), []storage.CompletedPart{{PartNumber: 1, ETag: "etag"}})
	if err != nil {
		t.Fatalf("CompleteUpload() error = %v", err)
	}
	if video.Status != videos.StatusProcessing || repository.markedSize != 5 {
		t.Errorf("video = %+v, markedSize = %d", video, repository.markedSize)
	}
}

func TestCompleteUploadDiscardsFileWhenSizeDiffersFromDeclared(t *testing.T) {
	store := storage.NewMemoryStorage()
	declared := uploadedVideo(t, store, 99, "hello")
	repository := &repositoryStub{video: declared}
	service := videos.NewService(repository, store, testSettings)

	_, err := service.CompleteUpload(context.Background(), uuid.New(), uuid.New(), []storage.CompletedPart{{PartNumber: 1, ETag: "etag"}})
	if !errors.Is(err, videos.ErrInvalidUpload) {
		t.Fatalf("CompleteUpload() error = %v, want ErrInvalidUpload", err)
	}
	if store.HasObject(declared.OriginalKey) || !repository.deleted {
		t.Error("mismatching upload was not discarded")
	}
}

func TestCompleteUploadRejectsIncompleteParts(t *testing.T) {
	store := storage.NewMemoryStorage()
	repository := &repositoryStub{video: uploadedVideo(t, store, partSize+1, "a", "b")}
	service := videos.NewService(repository, store, testSettings)

	for name, parts := range map[string][]storage.CompletedPart{
		"missing part": {{PartNumber: 1, ETag: "etag"}},
		"no etag":      {{PartNumber: 1, ETag: ""}, {PartNumber: 2, ETag: "etag"}},
		"out of order": {{PartNumber: 2, ETag: "etag"}, {PartNumber: 1, ETag: "etag"}},
	} {
		t.Run(name, func(t *testing.T) {
			_, err := service.CompleteUpload(context.Background(), uuid.New(), uuid.New(), parts)
			if !errors.Is(err, videos.ErrInvalidUpload) {
				t.Fatalf("CompleteUpload() error = %v, want ErrInvalidUpload", err)
			}
		})
	}
}
