# Dance Journal POC: Implementation Plan

Pivot from a YouTube audio streamer to a private dance-video journal. This plan is the source of truth for the POC. Check items off as they land.

## 1. Requirements (do not drop any)

| #   | Requirement                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------ |
| R1  | Run entirely locally: Docker backend, local Postgres, local file storage. Config via the existing env vars.              |
| R2  | Upload real video files. Accept at least `.mp4`, `.mov`, `.avi`, `.webm`, `.mkv`, `.m4v`.                                |
| R3  | A logged-in user can watch their uploaded videos in the app.                                                             |
| R4  | Playback starts as soon as the first bytes arrive. No waiting for the full file. Seeking works.                          |
| R5  | Postgres stores metadata only. Video bytes live in a storage backend, never in the DB.                                   |
| R6  | Videos are private: only the owner can list, stream, edit or delete them.                                                |
| R7  | Remove `yt-dlp` completely (code, Dockerfile, env, docs, tests, frontend).                                               |
| R8  | Storage sits behind an interface so local disk can later be swapped for R2/B2 (S3-compatible) without touching handlers. |
| R9  | Handle very large files (up to about 10 GB) without loading them into memory.                                            |
| R10 | Rename the confusing "video = audio" concept: everything is a real video now.                                            |

Out of scope for the POC (planned later, see section 9): client-side/at-rest encryption, cloud storage, HLS, mobile upload resume.

## 2. Key design decisions

1. **Storage interface with a local-disk implementation.** Files go to `STORAGE_DIR` (a Docker volume, `/data/videos`). Later: an S3 implementation with presigned multipart upload.
2. **Streaming via HTTP Range.** Serve with `http.ServeContent` over an `os.File`. It handles `Range`, `If-Range`, `206`, `Content-Length` and starts sending the first bytes immediately. The browser `<video src>` plays progressively and seeks with Range requests. No MSE or hls.js needed for the POC.
3. **Browser-playable output via ffmpeg.** MOV (often HEVC), AVI and MKV may not play in browsers. After upload, a background job produces a playback copy: H.264 + AAC MP4 with `-movflags +faststart` (moov atom first, so playback starts at once). Files that are already H.264/AAC MP4 or WebM are only remuxed or copied, not re-encoded. The original is kept.
4. **Processing states:** `uploading -> processing -> ready | failed`. The UI shows the state. Only `ready` videos are playable.
5. **Upload streamed to disk** with `multipart.Reader` (not `ParseMultipartForm`), a size cap via `http.MaxBytesReader`, and content validated with `ffprobe` (never trust the extension or `Content-Type`).
6. **Per-request deadlines.** The server currently has `ReadTimeout`/`WriteTimeout` of 10s ([main.go](backend/cmd/server/main.go)). That kills uploads and long streams. Keep sane server defaults and extend per request with `http.NewResponseController(w).SetReadDeadline/SetWriteDeadline`.
7. **Reuse what exists:** auth/session/CSRF, CORS, config, database, migrations, health, liked (becomes favorites), test utils.
8. **Job runner:** an in-process worker (goroutine plus buffered channel, concurrency 1) with startup recovery for videos stuck in `processing`. No queue service for the POC.

## 3. Data model (new migration `000007_dance_videos`)

Drop the YouTube-specific parts of `video` and rebuild it as the owned-video table. Existing rows are YouTube data and are discarded.

```
videos
  id            uuid PK default gen_random_uuid()
  owner_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
  title         text NOT NULL
  notes         text NOT NULL default ''
  recorded_at   date            -- when the dance was filmed (journal timeline)
  status        text NOT NULL   -- uploading | processing | ready | failed
  failure_reason text
  original_name text NOT NULL
  original_key  text NOT NULL   -- storage key of the uploaded file
  playback_key  text            -- storage key of the faststart MP4
  thumbnail_key text
  mime_type     text
  size_bytes    bigint NOT NULL default 0
  duration_ms   int
  width int, height int
  created_at, updated_at timestamptz default now()
  index (owner_id, recorded_at desc, created_at desc)
```

Also in this migration:

- `liked`: change `id` to `uuid`, `user_id` to `uuid` with FK to `users` and `videos`, cascade on delete. Rename concept to "favorites" in UI only; table name stays to keep the change small.
- `playback_history` (migration 000001): drop it. A play-count history is not part of the journal. This is an open question in section 8.
- Storage keys: `{owner_id}/{video_id}/original.ext`, `playback.mp4`, `thumb.jpg`. Never derive a path from user input.

## 4. API (all under auth plus CSRF unless noted)

| Method   | Path                         | Purpose                                                                                                           |
| -------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| POST     | `/api/videos`                | Streaming multipart upload (`file`, `title`, `notes`, `recorded_at`). Returns the video row, status `processing`. |
| GET      | `/api/videos`                | List own videos (cursor/limit, newest `recorded_at` first).                                                       |
| GET      | `/api/videos/{id}`           | Metadata plus status.                                                                                             |
| PATCH    | `/api/videos/{id}`           | Edit title/notes/recorded_at.                                                                                     |
| DELETE   | `/api/videos/{id}`           | Delete row and files.                                                                                             |
| GET      | `/api/videos/{id}/stream`    | Range stream of the playback file. Owner only. Session cookie auth, no CSRF (GET).                                |
| GET      | `/api/videos/{id}/thumbnail` | JPEG. Owner only.                                                                                                 |
| POST/GET | `/api/liked`                 | Existing favorites endpoints, ids become uuids.                                                                   |

Return 404 (not 403) for a video that exists but belongs to someone else.

## 5. Backend work breakdown

### Phase A: Remove yt-dlp and dead features

- [ ] Delete `backend/internal/ytdlp/` and its tests.
- [ ] Delete `backend/internal/stream/` (replaced in phase D), `search/`, `playlists/` and their routes in [main.go](backend/cmd/server/main.go).
- [ ] Remove `ytDlpEntry`/`GetVideosInfoResult` from `history` and `liked` models; drop `history` package if section 8 answer is "drop".
- [ ] Dockerfile: remove the yt-dlp download, `python3`, `nodejs`, `curl`; keep `ffmpeg` (includes `ffprobe`).
- [ ] Remove `YTDLP_COOKIES_FILE` references and any yt-dlp text in docs ([PROJECT_GOALS.md](PROJECT_GOALS.md), README, GEMINI.md, cheatsheet).
- [ ] `grep -ri "yt-dlp\|ytdlp\|youtube"` over the whole repo returns nothing.
- [ ] `go build ./... && go vet ./...` pass.

### Phase B: Storage layer (`internal/storage`)

- [ ] `Storage` interface: `Put(ctx, key, io.Reader) (size, error)`, `Open(ctx, key) (io.ReadSeekCloser, modTime, error)`, `Delete(ctx, key) error`, `Stat`.
- [ ] `LocalStorage`: root dir from `STORAGE_DIR`, writes to a temp file then atomic rename, rejects keys with `..` or absolute paths.
- [ ] Config: `STORAGE_DIR` (default `./data/videos`), `MAX_UPLOAD_BYTES` (default 20 GiB).
- [ ] docker-compose: named volume `video_data:/data/videos`, `STORAGE_DIR=/data/videos`, `MAX_UPLOAD_BYTES`.
- [ ] Tests: put/open/delete, path traversal rejected, atomic write.

### Phase C: Videos domain (`internal/videos`)

- [ ] Migration 000007 (up and down) as in section 3.
- [ ] Model, repository (create, get by id+owner, list, update, delete, set status, set processing result, list stuck `processing`), service.
- [ ] Ownership enforced in every query via `owner_id` (no unscoped getters).
- [ ] Tests (integration build tag like the existing ones).

### Phase D: Upload, processing, streaming

- [ ] Upload handler: stream `multipart.Reader` to storage, enforce `MAX_UPLOAD_BYTES`, extend deadlines, insert row first (`uploading`) then set `processing`. Clean up file and row on failure or client abort (context cancel).
- [ ] Extension allow-list only as a first filter; real validation = `ffprobe` finds a video stream and a sane duration.
- [ ] Processor worker: ffprobe (duration, size, codecs, dims) -> transcode or remux to faststart MP4 -> thumbnail at about 1s -> update row to `ready` or `failed` with reason. Use `exec.CommandContext` with a timeout; capture stderr into `failure_reason` and logs.
- [ ] Startup recovery: re-queue videos stuck in `processing`.
- [ ] Stream handler: auth, load by id+owner, require `ready`, set `Content-Type: video/mp4`, `Accept-Ranges`, `Cache-Control: private`, extend write deadline, `http.ServeContent`.
- [ ] Thumbnail handler (same ownership check).
- [ ] Wire into `newHTTPHandler`.
- [ ] Tests: upload rejects non-video, rejects oversize, other user gets 404, Range request returns 206 with correct bytes, first-byte latency is independent of file size (small test using a generated file).

### Phase E: Cleanup of shared pieces

- [ ] Update `liked` to uuid ids and ownership checks; update `testutils` and fixtures.
- [ ] Update [main_test.go](backend/cmd/server/main_test.go) routes.
- [ ] README/API docs for the backend.

## 6. Frontend work breakdown

- [ ] Remove: `features/search`, `features/playlists`, `features/history` (if dropped), `useMSEPlayer`, `hls.js` dependency, pages `app/search`, `app/playlists`, `app/auth/(protected)/playlists`, `app/auth/(protected)/history`, `testpage`, related api client code.
- [ ] `features/videos`: `api/videos.ts` (list, get, create via `XMLHttpRequest` or `fetch` with progress, patch, delete), react-query hooks.
- [ ] Upload view: drag-and-drop or picker (`accept="video/*,.mov,.avi,.mkv"`), title/notes/recorded date, real upload progress bar, cancel (`AbortController`), clear error messages.
- [ ] Library view: grid of thumbnails with title, date, duration, status badge (processing/failed); polling while any video is `processing`.
- [ ] Watch view: `<video controls src="/api/videos/{id}/stream">` with `preload="metadata"`, credentials included, edit and delete actions.
- [ ] Favorites view (existing liked UI adapted).
- [ ] Rename UI text from songs/tracks/music to videos/dances. Update Sidebar, Hero, landing, metadata, theme names as needed.
- [ ] Remove the audio player store/components that no longer apply.
- [ ] `yarn lint`, `yarn build`, `yarn test` pass.

## 7. Verification checklist (POC is done when all pass)

- [ ] `yarn start` brings up Postgres and backend; backend health is OK.
- [ ] Upload a small MP4, a MOV (iPhone HEVC), an AVI and a WebM. All reach `ready`.
- [ ] Upload a 2+ GB file: backend memory stays flat (check `docker stats`).
- [ ] Opening the watch page starts playback within about a second on a large file (network tab shows a `206` with a small first range).
- [ ] Seeking jumps without re-downloading the whole file.
- [ ] A second user cannot list, stream, or fetch the thumbnail of the first user's videos (404).
- [ ] Deleting a video removes the DB row and all files on disk.
- [ ] Aborting an upload leaves no orphan file or row.
- [ ] Restarting the backend mid-processing recovers the video.
- [ ] `grep -ri "yt-dlp\|ytdlp\|youtube"` is empty.
- [ ] `go test ./...` and `yarn test` pass.

## 8. Open questions (defaults assumed if unanswered)

1. Keep a play-history feature? **Default: drop it.**
2. Keep the "favorites" feature? **Default: keep.**
3. Max upload size? **Default: 20 GiB.**
4. Keep the original file after transcoding? **Default: yes** (the 4K original is the valuable copy).
5. Transcode quality for the playback copy? **Default: keep source resolution, H.264 CRF 23**; add a 1080p cap if it is slow.

## 9. After the POC (not part of this work)

1. S3-compatible `Storage` (Cloudflare R2 or Backblaze B2) with browser-direct presigned multipart upload so Render never handles the bytes.
2. Encryption: chunked AES-GCM (or HLS AES-128 segments) with the key from an env var, or client-side encryption for stronger privacy.
3. HLS output and adaptive bitrate if playback over slow networks matters.
4. Progress features: side-by-side compare, "this day last year", tags and styles, timeline calendar.
5. Move the worker to a real queue if processing volume grows.
