package auth

import (
    "context"
    "encoding/json"
    "net/http"
    "os"

    "github.com/google/uuid"
    "golang.org/x/oauth2"
    "golang.org/x/oauth2/google"

    "github.com/brandon-kong/parkshare/apps/api/internal/database"
    "github.com/brandon-kong/parkshare/apps/api/internal/models"
)

var googleOAuthConfig *oauth2.Config

func InitOAuth() {
    googleOAuthConfig = &oauth2.Config{
        ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
        ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
        RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
        Scopes:       []string{"email", "profile"},
        Endpoint:     google.Endpoint,
    }
}

type GoogleUser struct {
    ID      string `json:"id"`
    Email   string `json:"email"`
    Name    string `json:"name"`
    Picture string `json:"picture"`
}

// GoogleLogin redirects to Google's OAuth page
func GoogleLogin(w http.ResponseWriter, r *http.Request) {
    url := googleOAuthConfig.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
    http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// GoogleCallback handles the OAuth callback
func GoogleCallback(w http.ResponseWriter, r *http.Request) {
    code := r.URL.Query().Get("code")
    if code == "" {
        writeError(w, http.StatusBadRequest, "Missing code")
        return
    }

    // Exchange code for token
    token, err := googleOAuthConfig.Exchange(context.Background(), code)
    if err != nil {
        writeError(w, http.StatusInternalServerError, "Failed to exchange token")
        return
    }

    // Get user info from Google
    client := googleOAuthConfig.Client(context.Background(), token)
    resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
    if err != nil {
        writeError(w, http.StatusInternalServerError, "Failed to get user info")
        return
    }
    defer resp.Body.Close()

    var googleUser GoogleUser
    if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
        writeError(w, http.StatusInternalServerError, "Failed to decode user info")
        return
    }

    // Find or create user
    user, err := findOrCreateGoogleUser(googleUser)
    if err != nil {
        writeError(w, http.StatusInternalServerError, "Failed to create user")
        return
    }

    // Generate tokens
    tokens, err := GenerateTokens(user.ID)
    if err != nil {
        writeError(w, http.StatusInternalServerError, "Failed to generate tokens")
        return
    }

    // In production, redirect to frontend with tokens
    // For now, just return JSON
    writeJSON(w, http.StatusOK, AuthResponse{User: user, Tokens: tokens})
}

func findOrCreateGoogleUser(googleUser GoogleUser) (*models.User, error) {
    var user models.User

    // Check if user exists
    err := database.DB.Where("email = ?", googleUser.Email).First(&user).Error
    if err == nil {
        return &user, nil
    }

    // Create new user
    user = models.User{
        ID:         uuid.New(),
        Email:      googleUser.Email,
        Name:       googleUser.Name,
        AvatarURL:  googleUser.Picture,
        IsVerified: true, // Google verified the email
    }

    if err := database.DB.Create(&user).Error; err != nil {
        return nil, err
    }

    return &user, nil
}