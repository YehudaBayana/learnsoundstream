CREATE TABLE video (
    video_id VARCHAR(20) PRIMARY KEY,
    title TEXT NOT NULL,
    channel TEXT,
    duration_seconds INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_video_last_seen
    ON video (last_seen_at);