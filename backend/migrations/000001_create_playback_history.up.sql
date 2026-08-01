CREATE TABLE IF NOT EXISTS playback_history (
    user_id VARCHAR(50),
    video_id VARCHAR(50),
    play_count INT DEFAULT 1,
    last_played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, video_id)
);
