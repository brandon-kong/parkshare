package main

import (
	"log"
	"net/http"

	"github.com/brandon-kong/parkshare/apps/api/internal/database"
	"github.com/brandon-kong/parkshare/apps/api/internal/features/auth"
	"github.com/brandon-kong/parkshare/apps/api/internal/features/health"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }
	
	if err := database.Connect(); err != nil {
		log.Fatal(err)
	}

	router := chi.NewRouter()
	router.Use(middleware.Logger)

	router.Mount("/health", health.Routes())
	router.Mount("/api/v1/auth", auth.Routes())

	if err := http.ListenAndServe(":3000", router); err != nil {
		log.Fatal(err)
	}
}