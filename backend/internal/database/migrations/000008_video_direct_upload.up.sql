ALTER TABLE video
    ADD COLUMN upload_id text,
    ADD COLUMN upload_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_video_uploading_expires_at
    ON video (upload_expires_at)
    WHERE status = 'uploading';
