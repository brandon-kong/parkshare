package database

import (
	"fmt"
	"log"
	"os"

	"github.com/brandon-kong/parkshare/apps/api/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() error {
	dsn := os.Getenv("DATABASE_URL")

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Printf("Successfully connected to database\n")
	
	DB = db

	// Auto migrate
	if err := migrate(); err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}
	
	return nil
}

func migrate() error {
	err := DB.AutoMigrate(
		&models.User{},
		&models.Spot{},
		&models.SpotPhoto{},
	)

	if err != nil {
		return err
	}

	log.Println("Migrations complete")
	return nil
}