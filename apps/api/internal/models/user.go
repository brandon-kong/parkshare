package models

import (
	"time"
	"github.com/google/uuid"
)

type User struct {
    ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
    Email        string    `gorm:"uniqueIndex;not null" json:"email"`
    PasswordHash *string   `gorm:"not null" json:"-"`
    Name         string    `gorm:"not null" json:"name"`
    AvatarURL    *string   `json:"avatar_url"`
    Phone        *string   `json:"phone"`
    IsVerified   bool      `gorm:"default:false" json:"is_verified"`
    Provider     string    `gorm:"default:'credentials'" json:"provider"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}