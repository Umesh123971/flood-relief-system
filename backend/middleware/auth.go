package middlewares

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// contextKey type for context values
type contextKey string

const UserIDKey contextKey = "userID"

// AuthMiddleware validates JWT token
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get Authorization header
		authHeader := r.Header.Get("Authorization")

		// Check if header exists
		if authHeader == "" {
			http.Error(w, `{"error":"Authorization header required"}`, http.StatusUnauthorized)
			return
		}

		// Check if it starts with "Bearer "
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, `{"error":"Invalid authorization format. Use: Bearer <token>"}`, http.StatusUnauthorized)
			return
		}

		// Extract token
		tokenString := parts[1]

		// Parse and validate JWT token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Verify signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			// Return secret key for validation
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		// Check parsing errors
		if err != nil {
			http.Error(w, `{"error":"Invalid or expired token"}`, http.StatusUnauthorized)
			return
		}

		// Check if token is valid
		if !token.Valid {
			http.Error(w, `{"error":"Invalid token"}`, http.StatusUnauthorized)
			return
		}

		// Extract claims (payload data)
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, `{"error":"Invalid token claims"}`, http.StatusUnauthorized)
			return
		}

		// Get user ID from claims
		userID, ok := claims["user_id"]
		if !ok {
			http.Error(w, `{"error":"User ID not found in token"}`, http.StatusUnauthorized)
			return
		}

		// Add user ID to request context
		ctx := context.WithValue(r.Context(), UserIDKey, userID)

		// Pass request with updated context to next handler
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserIDFromContext extracts user ID from request context
func GetUserIDFromContext(ctx context.Context) (float64, bool) {
	userID, ok := ctx.Value(UserIDKey).(float64)
	return userID, ok
}
