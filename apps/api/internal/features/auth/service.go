package auth

import (
	"errors"
	"os"
	"time"
	"net/mail"

	"github.com/brandon-kong/parkshare/apps/api/internal/database"
	"github.com/brandon-kong/parkshare/apps/api/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials 	= errors.New("invalid credentials")
	ErrUserExists		  	= errors.New("user already exists")
)

type TokenPair struct {
	AccessToken			string	`json:"access_token"`
	RefreshToken		string	`json:"refresh_token"`
}

type Claims struct {
	UserID uuid.UUID `json:"user_id"`
	jwt.RegisteredClaims
}

// HashPassword hashes a plain text password
func HashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    return string(bytes), err
}

// CheckPassword compares a password with a hash
func CheckPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}

// GenerateTokens creates an access and refresh token pair
func GenerateTokens(userID uuid.UUID) (*TokenPair, error) {
    secret := []byte(os.Getenv("JWT_SECRET"))

    // Access token - 15 minutes
    accessClaims := &Claims{
        UserID: userID,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }
    accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
    accessString, err := accessToken.SignedString(secret)
    if err != nil {
        return nil, err
    }

    // Refresh token - 7 days
    refreshClaims := &Claims{
        UserID: userID,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }
    refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
    refreshString, err := refreshToken.SignedString(secret)
    if err != nil {
        return nil, err
    }

    return &TokenPair{
        AccessToken:  accessString,
        RefreshToken: refreshString,
    }, nil
}

// ValidateToken validates a JWT and returns the claims
func ValidateToken(tokenString string) (*Claims, error) {
    secret := []byte(os.Getenv("JWT_SECRET"))

    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        return secret, nil
    })

    if err != nil {
        return nil, err
    }

    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    }

    return nil, errors.New("invalid token")
}

// CreateUser registers a new user
func CreateUser(email, password, name string) (*models.User, *TokenPair, error) {
    // Check if user exists
    var existing models.User
    if err := database.DB.Where("email = ?", email).First(&existing).Error; err == nil {
        return nil, nil, ErrUserExists
    }

    // Hash password
    hash, err := HashPassword(password)
    if err != nil {
        return nil, nil, err
    }

    // Create user
    user := &models.User{
        ID:           uuid.New(),
        Email:        email,
        PasswordHash: &hash,
        Name:         name,
        IsVerified:   false,
    }

    if err := database.DB.Create(user).Error; err != nil {
        return nil, nil, err
    }

    // Generate tokens
    tokens, err := GenerateTokens(user.ID)
    if err != nil {
        return nil, nil, err
    }

    return user, tokens, nil
}

// AuthenticateUser logs in a user
func AuthenticateUser(email, password string) (*models.User, *TokenPair, error) {
    var user models.User
    if err := database.DB.Where("email = ?", email).First(&user).Error; err != nil {
        return nil, nil, ErrInvalidCredentials
    }

	if user.PasswordHash == nil || !CheckPassword(password, *user.PasswordHash) {
		return nil, nil, ErrInvalidCredentials
    }

    tokens, err := GenerateTokens(user.ID)
    if err != nil {
        return nil, nil, err
    }

    return &user, tokens, nil
}

// RefreshTokens generates new tokens from a refresh token
func RefreshTokens(refreshToken string) (*TokenPair, error) {
    claims, err := ValidateToken(refreshToken)
    if err != nil {
        return nil, err
    }

    return GenerateTokens(claims.UserID)
}

func validateRegister(req RegisterRequest) map[string]string {
    errors := make(map[string]string)

    if _, err := mail.ParseAddress(req.Email); err != nil {
        errors["email"] = "Invalid email format"
    }

    if len(req.Password) < 8 {
        errors["password"] = "Password must be at least 8 characters"
    }

    if req.Name == "" {
        errors["name"] = "Name is required"
    }

    return errors
}

// internal/features/auth/service.go

func FindOrCreateOAuthUser(provider, email, name, avatarURL string) (*models.User, *TokenPair, error) {
    var user models.User

    // Check if user exists
    err := database.DB.Where("email = ?", email).First(&user).Error
    if err == nil {
        // User exists, generate tokens
        tokens, err := GenerateTokens(user.ID)
        return &user, tokens, err
    }

    // Create new user
    user = models.User{
        ID:         uuid.New(),
        Email:      email,
        Name:       name,
        AvatarURL:  &avatarURL,
        Provider:   provider,
        IsVerified: true,
    }

    if err := database.DB.Create(&user).Error; err != nil {
        return nil, nil, err
    }

    tokens, err := GenerateTokens(user.ID)
    if err != nil {
        return nil, nil, err
    }

    return &user, tokens, nil
}

func EmailExists(email string) bool {
    var user models.User
    err := database.DB.Where("email = ?", email).First(&user).Error
    return err == nil
}

func GetUserByEmail(email string) (*models.User, bool) {
    var user models.User
    err := database.DB.Where("email = ?", email).First(&user).Error
    if err != nil {
        return nil, false
    }
    return &user, true
}