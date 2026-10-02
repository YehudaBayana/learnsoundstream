CREATE TABLE IF NOT EXISTS liked (
    user_id VARCHAR(50),
    id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, id)
);
