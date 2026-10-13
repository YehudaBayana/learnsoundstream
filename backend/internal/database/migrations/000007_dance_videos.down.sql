DROP TABLE IF EXISTS liked;
DROP TABLE IF EXISTS video;

CREATE TABLE video (
    id VARCHAR(100) PRIMARY KEY,
    title TEXT NOT NULL,
    channel TEXT,
    duration INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    direct_url TEXT,
    url_expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_video_last_seen
    ON video (last_seen_at);

CREATE TABLE IF NOT EXISTS playback_history (
    user_id VARCHAR(50),
    video_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, video_id)
);