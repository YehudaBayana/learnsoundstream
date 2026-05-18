# Soundstream Contribution Guidelines

Senior developer guidelines for the Soundstream codebase.

---

## 🏛️ Backend Architecture (Go)

- **Entry Point (`main.go`)**: Lightweight. Responsible only for initialization, standard `http.ServeMux` routing, and graceful shutdown (SIGINT/SIGTERM handling).
- **Isolation**: All endpoint handler logic must reside in `internal/handlers/`; middleware goes in `internal/middleware/`.
- **Subprocesses & Lifecycle**: Explicitly close pipes and pass a cancellable context to subprocesses (e.g. `yt-dlp`) to prevent zombie processes and CPU leaks.

---

## 🎨 Frontend Architecture (Next.js / TS)

- **Composition**: Pages (e.g. `page.tsx`) aggregate modular sections extracted to `components/`. Keep them clean and decoupled.
- **UI Primitives**: Do not use raw HTML tags for interaction or text. Use `src/components/ui/` (`Text`, `Heading`, `Button`, `IconButton`, `Slider`, `Badge`).
- **Layout Containers**: Do not use raw container tags (`div`, `section`, etc.) for positioning/layout. Use layout primitives in `src/components/ui/layout/` (`Flex`, `Grid`, `Container`, `Box`).
- **Direct Imports**: **Never** import from central index files (`@/components/ui` or `@/components/ui/layout`) to avoid dependency and bundle bloat. Import directly from individual files (e.g., `@/components/ui/Text`).

---

## ⚡ Styling (Tailwind v4 & PostCSS)

- **Utility Only**: Do not write custom CSS stylesheets.
- **Theme Extensions**: Define custom animations/keyframes under `@theme` in `globals.css` rather than config files.

---

## 🤝 Feature Workflow

1. **Storage**: Backend migrations and queries in `backend/internal/database/`.
2. **APIs**: Core endpoints in `backend/internal/handlers/` + companion unit tests.
3. **UI**: Modular components using frontend UI & layout primitives.
4. **Decoupling**: Connect components via state or events, avoiding direct coupling.
5. **Validation**: Check typescript compilation via `npx tsc --noEmit`.
