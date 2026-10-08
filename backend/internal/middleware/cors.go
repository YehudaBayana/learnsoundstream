package middleware

import (
	"net/http"
	"os"
	"strings"
)

const defaultAllowedOrigin = "http://localhost:3000"

// allowedOrigins reads a comma-separated ALLOWED_ORIGINS list (e.g. the Vercel URL).
func allowedOrigins() []string {
	var origins []string
	for _, origin := range strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",") {
		if origin = strings.TrimRight(strings.TrimSpace(origin), "/"); origin != "" {
			origins = append(origins, origin)
		}
	}
	if len(origins) == 0 {
		origins = []string{defaultAllowedOrigin}
	}
	return origins
}

// CORSMiddleware is a custom middleware function to handle Cross-Origin requests
func CORSMiddleware(nextHandler http.Handler) http.Handler {
	origins := allowedOrigins()

	return http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		// Echo the request origin only when allowed; credentials forbid a wildcard.
		allowOrigin := origins[0]
		for _, origin := range origins {
			if origin == request.Header.Get("Origin") {
				allowOrigin = origin
				break
			}
		}

		responseWriter.Header().Add("Vary", "Origin")
		responseWriter.Header().Set("Access-Control-Allow-Origin", allowOrigin)
		responseWriter.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		responseWriter.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token")
		responseWriter.Header().Set("Access-Control-Allow-Credentials", "true")
		responseWriter.Header().Set("X-CSRF-Token", "true")

		// Handle HTTP OPTIONS preflight request
		if request.Method == http.MethodOptions {
			responseWriter.WriteHeader(http.StatusOK)
			return
		}

		nextHandler.ServeHTTP(responseWriter, request)
	})
}
