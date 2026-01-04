package auth

import (
    "context"
    "net/http"
    "strings"
)

type contextKey string

const UserContextKey contextKey = "user"

// Middleware validates JWT and adds user to context
func Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        authHeader := r.Header.Get("Authorization")
        if authHeader == "" {
            writeError(w, http.StatusUnauthorized, "Missing authorization header")
            return
        }

        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            writeError(w, http.StatusUnauthorized, "Invalid authorization header")
            return
        }

        claims, err := ValidateToken(parts[1])
        if err != nil {
            writeError(w, http.StatusUnauthorized, "Invalid token")
            return
        }

        // Add claims to context
        ctx := context.WithValue(r.Context(), UserContextKey, claims)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// GetUserFromContext retrieves the claims from context
func GetUserFromContext(ctx context.Context) *Claims {
    claims, ok := ctx.Value(UserContextKey).(*Claims)
    if !ok {
        return nil
    }
    return claims
}