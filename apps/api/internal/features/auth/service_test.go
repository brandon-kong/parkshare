package auth

import (
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func TestHashPassword(t *testing.T) {
	password := "testpassword123"

	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}

	if hash == "" {
		t.Error("HashPassword returned empty hash")
	}

	if hash == password {
		t.Error("HashPassword returned unhashed password")
	}
}

func TestHashPassword_DifferentHashes(t *testing.T) {
	password := "testpassword123"

	hash1, _ := HashPassword(password)
	hash2, _ := HashPassword(password)

	if hash1 == hash2 {
		t.Error("HashPassword should generate different hashes for the same password (due to salt)")
	}
}

func TestCheckPassword(t *testing.T) {
	password := "testpassword123"
	hash, _ := HashPassword(password)

	tests := []struct {
		name     string
		password string
		hash     string
		want     bool
	}{
		{
			name:     "correct password",
			password: password,
			hash:     hash,
			want:     true,
		},
		{
			name:     "wrong password",
			password: "wrongpassword",
			hash:     hash,
			want:     false,
		},
		{
			name:     "empty password",
			password: "",
			hash:     hash,
			want:     false,
		},
		{
			name:     "invalid hash",
			password: password,
			hash:     "invalidhash",
			want:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := CheckPassword(tt.password, tt.hash)
			if got != tt.want {
				t.Errorf("CheckPassword() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestGenerateTokens(t *testing.T) {
	// Set up test JWT secret
	os.Setenv("JWT_SECRET", "test-secret-key-for-testing")
	defer os.Unsetenv("JWT_SECRET")

	userID := uuid.New()

	tokens, err := GenerateTokens(userID)
	if err != nil {
		t.Fatalf("GenerateTokens failed: %v", err)
	}

	if tokens.AccessToken == "" {
		t.Error("GenerateTokens returned empty access token")
	}

	if tokens.RefreshToken == "" {
		t.Error("GenerateTokens returned empty refresh token")
	}

	if tokens.AccessToken == tokens.RefreshToken {
		t.Error("Access token and refresh token should be different")
	}
}

func TestValidateToken(t *testing.T) {
	// Set up test JWT secret
	os.Setenv("JWT_SECRET", "test-secret-key-for-testing")
	defer os.Unsetenv("JWT_SECRET")

	userID := uuid.New()
	tokens, _ := GenerateTokens(userID)

	t.Run("valid access token", func(t *testing.T) {
		claims, err := ValidateToken(tokens.AccessToken)
		if err != nil {
			t.Fatalf("ValidateToken failed for valid token: %v", err)
		}

		if claims.UserID != userID {
			t.Errorf("UserID mismatch: got %v, want %v", claims.UserID, userID)
		}
	})

	t.Run("valid refresh token", func(t *testing.T) {
		claims, err := ValidateToken(tokens.RefreshToken)
		if err != nil {
			t.Fatalf("ValidateToken failed for valid refresh token: %v", err)
		}

		if claims.UserID != userID {
			t.Errorf("UserID mismatch: got %v, want %v", claims.UserID, userID)
		}
	})

	t.Run("invalid token", func(t *testing.T) {
		_, err := ValidateToken("invalid-token")
		if err == nil {
			t.Error("ValidateToken should fail for invalid token")
		}
	})

	t.Run("wrong secret", func(t *testing.T) {
		// Generate token with different secret
		os.Setenv("JWT_SECRET", "different-secret")
		wrongTokens, _ := GenerateTokens(userID)
		os.Setenv("JWT_SECRET", "test-secret-key-for-testing")

		_, err := ValidateToken(wrongTokens.AccessToken)
		if err == nil {
			t.Error("ValidateToken should fail for token signed with different secret")
		}
	})
}

func TestValidateToken_Expired(t *testing.T) {
	os.Setenv("JWT_SECRET", "test-secret-key-for-testing")
	defer os.Unsetenv("JWT_SECRET")

	userID := uuid.New()
	secret := []byte(os.Getenv("JWT_SECRET"))

	// Create an expired token
	expiredClaims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)), // Expired 1 hour ago
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
		},
	}
	expiredToken := jwt.NewWithClaims(jwt.SigningMethodHS256, expiredClaims)
	expiredString, _ := expiredToken.SignedString(secret)

	_, err := ValidateToken(expiredString)
	if err == nil {
		t.Error("ValidateToken should fail for expired token")
	}
}

func TestRefreshTokens(t *testing.T) {
	os.Setenv("JWT_SECRET", "test-secret-key-for-testing")
	defer os.Unsetenv("JWT_SECRET")

	userID := uuid.New()
	originalTokens, _ := GenerateTokens(userID)

	// Wait a tiny bit to ensure new tokens have different timestamps
	time.Sleep(10 * time.Millisecond)

	newTokens, err := RefreshTokens(originalTokens.RefreshToken)
	if err != nil {
		t.Fatalf("RefreshTokens failed: %v", err)
	}

	if newTokens.AccessToken == "" {
		t.Error("RefreshTokens returned empty access token")
	}

	// Verify the new tokens are valid and contain the same user ID
	claims, err := ValidateToken(newTokens.AccessToken)
	if err != nil {
		t.Fatalf("New access token is invalid: %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("UserID mismatch after refresh: got %v, want %v", claims.UserID, userID)
	}
}

func TestRefreshTokens_InvalidToken(t *testing.T) {
	os.Setenv("JWT_SECRET", "test-secret-key-for-testing")
	defer os.Unsetenv("JWT_SECRET")

	_, err := RefreshTokens("invalid-refresh-token")
	if err == nil {
		t.Error("RefreshTokens should fail with invalid token")
	}
}

func TestValidateRegister(t *testing.T) {
	tests := []struct {
		name       string
		req        RegisterRequest
		wantErrors []string // fields that should have errors
	}{
		{
			name: "valid request",
			req: RegisterRequest{
				Email:    "test@example.com",
				Password: "password123",
				Name:     "Test User",
			},
			wantErrors: []string{},
		},
		{
			name: "invalid email",
			req: RegisterRequest{
				Email:    "invalid-email",
				Password: "password123",
				Name:     "Test User",
			},
			wantErrors: []string{"email"},
		},
		{
			name: "short password",
			req: RegisterRequest{
				Email:    "test@example.com",
				Password: "short",
				Name:     "Test User",
			},
			wantErrors: []string{"password"},
		},
		{
			name: "empty name",
			req: RegisterRequest{
				Email:    "test@example.com",
				Password: "password123",
				Name:     "",
			},
			wantErrors: []string{"name"},
		},
		{
			name: "all invalid",
			req: RegisterRequest{
				Email:    "bad",
				Password: "short",
				Name:     "",
			},
			wantErrors: []string{"email", "password", "name"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			errs := validateRegister(tt.req)

			if len(tt.wantErrors) == 0 && len(errs) > 0 {
				t.Errorf("Expected no errors, got: %v", errs)
				return
			}

			for _, field := range tt.wantErrors {
				if _, exists := errs[field]; !exists {
					t.Errorf("Expected error for field %q, but got none", field)
				}
			}

			if len(errs) != len(tt.wantErrors) {
				t.Errorf("Expected %d errors, got %d: %v", len(tt.wantErrors), len(errs), errs)
			}
		})
	}
}

func TestTokenPairStructure(t *testing.T) {
	os.Setenv("JWT_SECRET", "test-secret-key-for-testing")
	defer os.Unsetenv("JWT_SECRET")

	userID := uuid.New()
	tokens, _ := GenerateTokens(userID)

	// Verify access token expires sooner than refresh token
	accessClaims, _ := ValidateToken(tokens.AccessToken)
	refreshClaims, _ := ValidateToken(tokens.RefreshToken)

	if accessClaims.ExpiresAt.Time.After(refreshClaims.ExpiresAt.Time) {
		t.Error("Access token should expire before refresh token")
	}
}
