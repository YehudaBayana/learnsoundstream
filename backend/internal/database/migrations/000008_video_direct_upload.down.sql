DROP INDEX IF EXISTS idx_video_uploading_expires_at;

ALTER TABLE video
    DROP COLUMN IF EXISTS upload_expires_at,
    DROP COLUMN IF EXISTS upload_id;
