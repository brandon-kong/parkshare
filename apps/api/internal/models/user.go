package models

import (
	"time"
	"github.com/google/uuid"
)

type User struct {
	ID				uuid.UUID 	`gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Email			string	  	`gorm:"uniqueIndex;not null"`
	PasswordHash	string		`gorm:"not null"`
	Name			string		`gorm:"not null"`
	AvatarURL		string
	Phone			string
	IsVerified		bool		`gorm:"default:false"`
	Provider     string    `gorm:"default:'email'"`
	CreatedAt		time.Time
	UpdatedAt		time.Time
}