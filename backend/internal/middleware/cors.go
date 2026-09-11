package middleware

import "net/http"

// CORSMiddleware is a custom middleware function to handle Cross-Origin requests
func CORSMiddleware(nextHandler http.Handler) http.Handler {
	return http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		// Allow requests from Next.js local server
		responseWriter.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		responseWriter.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		responseWriter.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle HTTP OPTIONS preflight request
		if request.Method == http.MethodOptions {
			responseWriter.WriteHeader(http.StatusOK)
			return
		}

		nextHandler.ServeHTTP(responseWriter, request)
	})
}
