// Unset in production = same-origin calls, proxied to BACKEND_URL by next.config.ts.
export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:8080");
