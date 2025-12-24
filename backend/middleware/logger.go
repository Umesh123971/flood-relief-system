package middlewares

import (
	"log"
	"net/http"
	"time"
)

// responseWriter wraps http.ResponseWriter to capture status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

// WriteHeader captures the status code
func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// LoggerMiddleware logs all HTTP requests
func LoggerMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Record start time
		start := time.Now()

		// Wrap response writer to capture status code
		wrapped := &responseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK, // Default status
		}

		// Call next handler
		next.ServeHTTP(wrapped, r)

		// Calculate request duration
		duration := time.Since(start)

		// Log request details
		log.Printf(
			"[%s] %s %s - Status: %d - Duration: %v",
			r.Method,           // HTTP method (GET, POST, etc.)
			r.RequestURI,       // Requested URL path
			r.RemoteAddr,       // Client IP address
			wrapped.statusCode, // HTTP status code
			duration,           // Time taken to process request
		)
	})
}
