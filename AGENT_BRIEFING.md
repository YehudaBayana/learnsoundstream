# Agent Briefing: read this BEFORE `IMPLEMENTATION_PLAN.md`

This briefing gives the context you need. [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) is the task. Read this file first, then the plan, then start with Phase A.

## 1. What this project is today

"SoundStream" is a full-stack music streaming web app. It is a **learning project**: the owner is a frontend developer learning backend engineering in Go. See [PROJECT_GOALS.md](PROJECT_GOALS.md) for the original philosophy.

- **Backend** (`backend/`): Go, standard library `net/http` with `ServeMux` (no web framework), `pgx` for Postgres, `slog` logging. Packages under `backend/internal/`: `auth` (sessions, CSRF, password hashing), `config`, `database` (+ SQL `migrations/`), `health`, `history`, `liked`, `middleware` (CORS), `playlists`, `search`, `stream`, `videos`, `ytdlp`, `testutils`. Entry point: [backend/cmd/server/main.go](backend/cmd/server/main.go).
- **Frontend** (`frontend/`): Next.js 16 (App Router), React 19, TypeScript, TanStack Query, Zustand, Tailwind 4. Feature folders under `src/features/` (auth, dashboard, history, liked, player, playlists, search). API client: `src/api/apiClient.ts`.
- **Infra:** `docker-compose.yml` (Postgres 15 + backend), `backend/Dockerfile`, `render.yaml` (backend deployed on Render), `frontend/vercel.json` (frontend on Vercel). Root `package.json` has the scripts: `yarn start`, `yarn stop`, `yarn restart`, `yarn test-server`.
- **How music playback works today:** the user searches or opens a playlist, the backend shells out to the `yt-dlp` CLI to search YouTube and to resolve a direct audio URL (`yt-dlp -f 140 -g`), then proxies that audio to the browser (`GET /api/stream/manifest?v=<youtubeID>`). The frontend plays it with a custom MSE player (`features/player/hooks/useMSEPlayer.ts`).
- **Terminology trap:** in code, DB and API, "video" currently means a YouTube item that is really **audio only**. The `video` table stores YouTube metadata (`id` = YouTube video ID, title, channel, duration). After this work, "video" must mean a real uploaded video file.

## 2. The problem with the current state

The deployed backend on Render fails on playback: after about 10 seconds the request returns 502. We found the cause in the logs: YouTube answers yt-dlp with **"Sign in to confirm you're not a bot"** because Render runs on datacenter IPs. It works locally only because a home IP is not blocked.

We tried workarounds: logging yt-dlp's stderr (that logging is committed, which is how we found the cause), and a Node JS-runtime plus cookie-file approach. **The cookie/JS-runtime work was discarded and is not in the tree.** Cookies expire in days to weeks, and YouTube keeps blocking cloud IPs. Scraping YouTube from a cloud host is not a durable foundation.

The deeper issue is that the app depends on a third party the owner cannot control.

## 3. What we are shifting to, and why

**New direction: a private dance-video journal.**

The owner films their dancing and wants to store and rewatch the videos to see progress and feel nostalgic. Today the videos sit on an external SSD, kept private on purpose so nobody sees them when borrowing the phone or Mac. They want one app where they:

1. upload their own videos,
2. keep them private (only the owner can see them),
3. watch them with **fast start**: playback begins when the first chunk arrives, with seeking, not after the whole file downloads.

Why this works:

- **Full control.** Their own files, no dependence on YouTube, no scraping, no legal grey area. This was the deciding factor, since the owner said they refuse to build on something they can't control.
- **Reuse.** Auth, sessions/CSRF, CORS, Postgres, migrations, Docker, CI, tests and the Next.js app shell are already built and stay.
- **Same learning goals.** It still exercises streaming large files, HTTP Range, concurrency and background jobs, context cancellation, memory efficiency and storage abstraction.

An alternative considered and not chosen: a "game-night hub" for European football and NBA scores, podcasts and reactions. It might come later as a second module. Do not build it now.

## 4. Scope boundaries and key constraints

- **POC is local only:** local Docker backend, local Postgres, files on a Docker volume. The owner has not paid for hosting yet. Do not deploy and do not touch `render.yaml` or `vercel.json` beyond what removal of yt-dlp forces.
- **Database stores metadata only.** Video bytes never go in Postgres. This is a project rule from `PROJECT_GOALS.md`.
- **Storage must be behind an interface.** Later it will move to S3-compatible object storage (Cloudflare R2 or Backblaze B2) with browser-direct presigned uploads. Local disk is only the POC implementation. Render's free tier has no persistent disk, so local storage is not for production.
- **Encryption is out of scope for the POC** but is planned later (chunked AES-GCM or HLS AES-128 with a key in an env var). Design the storage and streaming code so it can be added; don't add it now.
- **Files can be about 10 GB (4K).** Never buffer a whole file in memory. Stream everything.
- **Formats:** `.mp4`, `.mov`, `.avi`, `.webm`, `.mkv`, `.m4v` at least. iPhone MOV is often HEVC, which many browsers can't play, hence the ffmpeg playback copy in the plan.
- **Remove yt-dlp completely** (code, Dockerfile, env, docs, frontend, tests). Verify with a repo-wide `grep -ri "yt-dlp\|ytdlp\|youtube"` excluding `node_modules`, `.git` and `.next`. Currently it appears in the `ytdlp`, `stream`, `search`, `playlists`, `videos`, `history` and `liked` backend packages, `main_test.go`, the `Dockerfile`, `PROJECT_GOALS.md`, `CONTRIBUTING.md`, and several frontend files (`PlaylistCard`, `HomeView`, `AudioPlayerTrackInfo`, `EmptyState`).

## 5. Current working-tree state

- Git is on `main`. The only uncommitted change is the staged `IMPLEMENTATION_PLAN.md` (and this file). **No implementation work has started.** `backend/internal/storage/` exists but is an empty directory.
- A `git stash` entry (`stash@{0}`) exists from earlier work. **Do not apply, drop or clear it.**
- Some files were edited by tools between sessions, so **always re-read a file before editing it.**
- Do not use destructive git commands. Do not commit or push unless asked.

## 6. Repo conventions and gotchas

- **Next.js is not the version you know.** [frontend/AGENTS.md](frontend/AGENTS.md) says to read the guides in `frontend/node_modules/next/dist/docs/` before writing frontend code and to heed deprecation notices. Next 16 and React 19 are in use.
- **Frontend duplicates:** many components exist twice, once flat and once in a folder (for example `components/ui/Tabs.tsx` and `components/ui/tabs/Tabs.tsx`; `features/dashboard/components/Sidebar.tsx` and `.../sidebar/Sidebar.tsx`). Check which one is imported before editing or deleting, and don't assume they are identical.
- **Backend tests:** unit tests live in `backend/internal/<pkg>/tests/`. Integration tests use the `integration` build tag and need Postgres: run `yarn test-server` from the repo root (it starts the Postgres container and runs `go test -tags=integration`). Plain `go test ./...` runs the unit tests only. CI runs both backend and frontend tests (`.github/workflows`).
- **Frontend checks:** from `frontend/`, run `yarn lint`, `yarn test` (Jest), `yarn build` (runs eslint first).
- **Backend style:** keep it simple, standard library first, small interfaces, explicit errors wrapped with `%w`, `context` passed everywhere, `slog` for logs. The owner wants readable code over clever code and avoids heavy OOP or framework "magic".
- **Secrets:** the root `.env` holds local DB values and Neon connection strings. Never print, log, copy or commit them. For the POC use the local Postgres values (`DB_*`, `DB_URL`) as the existing scripts do.
- **Migrations** are numbered pairs in `backend/internal/database/migrations/` (`NNNNNN_name.up.sql` and `.down.sql`). The last one is `000006`. Check how `database.InitDB` applies them before adding `000007`.
- **Server timeouts** in `main.go` are 10s read and 10s write. They will break big uploads and long streams, so the plan handles this with per-request deadlines. Don't just raise the global timeout.
- **Docker image** currently installs `ffmpeg` and `python3` and downloads yt-dlp. Keep `ffmpeg` (it provides `ffprobe`), remove the rest.
- **Communication style the owner prefers:** short, direct answers, no emojis, no time estimates. Do not create extra markdown files beyond the plan and this briefing unless asked.

## 6b. Questions already answered with defaults

The plan's section 8 lists open questions with defaults (drop play history, keep favorites, 20 GiB max upload, keep the original file, H.264 CRF 23 playback copy). Use the defaults unless the owner says otherwise.

## 7. How to work

1. Read this file, then [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) fully.
2. Work in the plan's phase order (A, B, C, D, E, then frontend). Keep `go build ./...`, `go vet ./...` and the tests passing at the end of each phase.
3. Tick the checkboxes in the plan as items land.
4. Finish by walking through the verification checklist (plan section 7) and report what passed and what you could not verify (for example, real-device MOV uploads).
