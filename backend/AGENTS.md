# Backend rules for agents

Read this before changing anything under `backend/`. Follow the structure below and reuse the existing pieces instead of inventing new ones. The reference feature is `internal/videos`; copy its shape for new features.

## Package layout

One package per feature under `internal/<feature>/`. Each file has exactly one job:

| File            | Contains                                                                                                                                    | Must not contain                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `model.go`      | Domain structs, status constants, sentinel errors (`ErrNotFound`), request DTOs, the `Repository` interface                                 | SQL, HTTP, business rules                |
| `repository.go` | SQL only: queries, row scanning, mapping `pgx.ErrNoRows` to the domain `ErrNotFound`                                                        | HTTP, filesystem, business rules         |
| `service.go`    | Business rules and orchestration (repository + storage). Wraps errors with `%w`                                                             | `net/http`, SQL                          |
| `handler.go`    | One method per endpoint: read request, call service, write response. Nothing else                                                           | Parsing helpers, SQL, ffmpeg, file loops |
| `request.go`    | Request parsing and validation helpers (path ids, pagination, dates, current user)                                                          | Response writing for success cases       |
| `response.go`   | Response helpers: error mapping (`writeServiceError`), deadlines                                                                            | Business rules                           |
| other files     | Named after the concern: `upload.go` (multipart), `media.go` (ffmpeg/ffprobe), `processor.go` (background worker), `keys.go` (storage keys) | Mixed concerns                           |
| `tests/`        | External-package tests (`package <feature>_test`). Integration tests carry `//go:build integration`                                         | -                                        |

Unexported helpers that need white-box tests may have a `<file>_test.go` next to the code (see `videos/upload_test.go`).

Never put a helper in `handler.go` or `repository.go`. If a function is not an endpoint or a query, it belongs in a concern file.

## Shared pieces: reuse, do not duplicate

- `internal/httputil`: `WriteJSON` and `WriteError` (error body is `{"error":{"code","message"}}`). Use them for every JSON response in new code.
- `internal/auth`: `auth.UserIDFrom(ctx)` gives the logged-in user. Routes are wrapped with `sessions.Auth(sessions.CSRF(...))` in `cmd/server/main.go`.
- `internal/storage`: the `Storage` interface. Never touch the filesystem for user files outside it. Keys come from `videos/keys.go`, never from user input.
- `internal/testutils`: `OpenTestDB`, `SeedAuthUser`, `Request`. Use them in tests instead of writing new fixtures.
- `internal/config`: all environment variables are read in `config.Load()` only. Pass `config.Config` values down; do not call `os.Getenv` elsewhere.

## Typing rules

- No `any` / `interface{}` and no type assertions to work around a missing method. If the service needs a repository method, add it to the `Repository` interface in `model.go` and implement it. Generics are fine where they remove an `any`.
- Ids are `uuid.UUID`, never strings. Parse once at the HTTP boundary (`request.go`); an invalid id is treated as not found.
- Statuses and other closed sets are typed constants (`Status`), not string literals.
- Keep SQL typed: no `id::text = $1` casts to dodge types. Fix the Go type instead.
- Nullable columns are `COALESCE`d in SQL so rows scan into plain Go values. Define the column list once (`videoColumns`) and scan with one `scanVideo` function. Never copy a scan block.
- Constructors return concrete types; interfaces are defined by the consumer (`Repository` in `model.go` is consumed by `Service`). No nil-dependency checks: build dependencies in `main.go` and fail at startup if one cannot be created.

## Naming

- Descriptive names only, no one-letter variables (`responseWriter`, `request`, `ownerID`, not `w`, `r`, `o`). The only allowed exception is `t *testing.T`.
- Receivers are descriptive too: `(handler *Handler)`, `(service *Service)`, `(repository *Repository)`.
- Handlers are `Handle<Action>`, repository methods are verbs (`Create`, `GetByID`, `ListByOwner`, `MarkReady`).

## Behavior rules

- Privacy: every query that touches user data takes `ownerID` and filters by it. Return `ErrNotFound` (HTTP 404) for another user's data, never 403. The only unscoped query is the worker's startup recovery (`ListProcessing`), and it is named as such.
- Errors: wrap with `fmt.Errorf("verb noun: %w", err)`. Handlers map errors in one place (`writeServiceError`); unknown errors become a logged 500 with a generic message. Never put raw `err.Error()` of internal failures in a response.
- Large files are streamed, never buffered. Uploads use `multipart.Reader`; playback uses `http.ServeContent` (it handles Range/206).
- Extend per-request deadlines with `allowLongTransfer`; do not raise the global server timeouts.
- Cleanup after a failed or aborted request uses `context.WithoutCancel` (see `Service.DiscardFiles`), otherwise it is skipped when the client disconnects.
- Background work gets a `context.Context` from `main.go` and stops when it is cancelled.
- Standard library first (`net/http` `ServeMux` with `{id}` path values). Logging uses `slog` with key/value pairs.
- Migrations are numbered pairs in `internal/database/migrations/`; never edit an applied one, add the next number.
- Do not reintroduce yt-dlp, YouTube or any third-party media source.

## Adding a new feature (checklist)

1. Create `internal/<feature>/` with `model.go`, `repository.go`, `service.go`, `handler.go`, plus `request.go` / `response.go` when needed.
2. Add the migration pair if the schema changes.
3. Wire repository, service and handler in `newHTTPHandler` (`cmd/server/main.go`) and register routes there. Wrap protected routes the same way as the existing ones.
4. Add unit tests (stub `Repository`) and integration tests (`//go:build integration`) under `tests/`, including the "other user gets 404" case.
5. Run `go build ./... && go vet ./... && gofmt -l .` and `go test ./...`; run `yarn test-server` from the repo root for integration tests.
