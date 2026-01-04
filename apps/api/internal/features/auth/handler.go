package auth

import (
	"encoding/json"
	"net/http"

	"github.com/brandon-kong/parkshare/apps/api/internal/models"
	"github.com/go-chi/chi/v5"
)

type RegisterRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
    Name     string `json:"name"`
}

type LoginRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

type RefreshRequest struct {
    RefreshToken string `json:"refresh_token"`
}

type AuthResponse struct {
    User   *models.User      `json:"user"`
    Tokens *TokenPair `json:"tokens"`
}

type ErrorResponse struct {
    Error string `json:"error"`
}

func Routes() chi.Router {
    r := chi.NewRouter()

    r.Post("/register", Register)
    r.Post("/login", Login)
    r.Post("/refresh", Refresh)

    return r
}

func Register(w http.ResponseWriter, r *http.Request) {
    var req RegisterRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        writeError(w, http.StatusBadRequest, "Invalid request body")
        return
    }

    // Basic validation
    if req.Email == "" || req.Password == "" || req.Name == "" {
        writeError(w, http.StatusBadRequest, "Email, password, and name are required")
        return
    }

    user, tokens, err := CreateUser(req.Email, req.Password, req.Name)
    if err != nil {
        if err == ErrUserExists {
            writeError(w, http.StatusConflict, "User already exists")
            return
        }
        writeError(w, http.StatusInternalServerError, "Failed to create user")
        return
    }

    writeJSON(w, http.StatusCreated, AuthResponse{User: user, Tokens: tokens})
}

func Login(w http.ResponseWriter, r *http.Request) {
    var req LoginRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        writeError(w, http.StatusBadRequest, "Invalid request body")
        return
    }

    user, tokens, err := AuthenticateUser(req.Email, req.Password)
    if err != nil {
        if err == ErrInvalidCredentials {
            writeError(w, http.StatusUnauthorized, "Invalid email or password")
            return
        }
        writeError(w, http.StatusInternalServerError, "Failed to authenticate")
        return
    }

    writeJSON(w, http.StatusOK, AuthResponse{User: user, Tokens: tokens})
}

func Refresh(w http.ResponseWriter, r *http.Request) {
    var req RefreshRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        writeError(w, http.StatusBadRequest, "Invalid request body")
        return
    }

    tokens, err := RefreshTokens(req.RefreshToken)
    if err != nil {
        writeError(w, http.StatusUnauthorized, "Invalid refresh token")
        return
    }

    writeJSON(w, http.StatusOK, tokens)
}

// Helper functions
func writeJSON(w http.ResponseWriter, status int, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
    writeJSON(w, status, ErrorResponse{Error: message})
}