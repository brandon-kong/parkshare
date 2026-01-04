package auth

import (
	"encoding/json"
	"net/http"

	"github.com/brandon-kong/parkshare/apps/api/internal/models"
	"github.com/brandon-kong/parkshare/apps/api/util"
	"github.com/go-chi/chi/v5"
)

type CheckEmailRequest struct {
    Email string `json:"email"`
}

type CheckEmailResponse struct {
    Exists   bool    `json:"exists"`
    Provider *string `json:"provider,omitempty"`
}

type OAuthRequest struct {
    Provider  string `json:"provider"`
    Email     string `json:"email"`
    Name      string `json:"name"`
    AvatarURL string `json:"avatar_url"`
}

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

    r.Post("/check-email", CheckEmail)
    r.Post("/register", Register)
    r.Post("/login", Login)
    r.Post("/refresh", Refresh)
	r.Post("/oauth", OAuth)

    return r
}

func CheckEmail(w http.ResponseWriter, r *http.Request) {
    var req CheckEmailRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        util.WriteError(w, http.StatusBadRequest, "Invalid request body")
        return
    }

    user, exists := GetUserByEmail(req.Email)
    
    response := CheckEmailResponse{Exists: exists}
    if exists {
        response.Provider = &user.Provider
    }
    
    util.WriteJSON(w, http.StatusOK, response)
}

func Register(w http.ResponseWriter, r *http.Request) {
    var req RegisterRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        util.WriteError(w, http.StatusBadRequest, "Invalid request body")
        return
    }

	if errs := validateRegister(req); len(errs) > 0 {
		util.WriteJSON(w, http.StatusBadRequest, map[string]interface{}{
			"error": "Validation failed",
			"fields": errs,
		})
		return
	}

    user, tokens, err := CreateUser(req.Email, req.Password, req.Name)
    if err != nil {
        if err == ErrUserExists {
            util.WriteError(w, http.StatusConflict, "User already exists")
            return
        }
        util.WriteError(w, http.StatusInternalServerError, "Failed to create user")
        return
    }

    util.WriteJSON(w, http.StatusCreated, AuthResponse{User: user, Tokens: tokens})
}

func Login(w http.ResponseWriter, r *http.Request) {
    var req LoginRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        util.WriteError(w, http.StatusBadRequest, "Invalid request body")
        return
    }

    user, tokens, err := AuthenticateUser(req.Email, req.Password)
    if err != nil {
        if err == ErrInvalidCredentials {
            util.WriteError(w, http.StatusUnauthorized, "Invalid email or password")
            return
        }
        util.WriteError(w, http.StatusInternalServerError, "Failed to authenticate")
        return
    }

    util.WriteJSON(w, http.StatusOK, AuthResponse{User: user, Tokens: tokens})
}

func Refresh(w http.ResponseWriter, r *http.Request) {
    var req RefreshRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        util.WriteError(w, http.StatusBadRequest, "Invalid request body")
        return
    }

    tokens, err := RefreshTokens(req.RefreshToken)
    if err != nil {
        util.WriteError(w, http.StatusUnauthorized, "Invalid refresh token")
        return
    }

    util.WriteJSON(w, http.StatusOK, tokens)
}

func OAuth(w http.ResponseWriter, r *http.Request) {
    var req OAuthRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        util.WriteError(w, http.StatusBadRequest, "Invalid request body")
        return
    }

    user, tokens, err := FindOrCreateOAuthUser(req.Provider, req.Email, req.Name, req.AvatarURL)
    if err != nil {
        util.WriteError(w, http.StatusInternalServerError, "Failed to authenticate")
        return
    }

    util.WriteJSON(w, http.StatusOK, AuthResponse{User: user, Tokens: tokens})
}