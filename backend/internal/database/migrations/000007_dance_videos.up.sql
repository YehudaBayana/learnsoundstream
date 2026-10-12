CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS playback_history;
DROP TABLE IF EXISTS liked;
DROP TABLE IF EXISTS video;

CREATE TABLE video (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL,
    notes text NOT NULL DEFAULT '',
    recorded_at date,
    status text NOT NULL DEFAULT 'uploading',
    failure_reason text,
    original_name text NOT NULL DEFAULT '',
    original_key text NOT NULL,
    playback_key text,
    thumbnail_key text,
    mime_type text,
    size_bytes bigint NOT NULL DEFAULT 0,
    duration_ms int,
    width int,
    height int,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_owner_recorded_at
    ON video (owner_id, recorded_at DESC, created_at DESC);

CREATE TABLE liked (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id uuid NOT NULL REFERENCES video(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, id)
);
