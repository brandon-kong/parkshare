package main

import (
	"log"
	"os"
	"net/http"
	"time"

	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"

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

	auth.InitOAuth()

	router := chi.NewRouter()

	// Middleware
	if useCors := os.Getenv("DATABASE_URL"); useCors == "true" {
		router.Use(cors.Handler(cors.Options{
			AllowedOrigins:   []string{"http://localhost:3000"},
			AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowedHeaders:   []string{"Authorization", "Content-Type"},
			AllowCredentials: true,
		}))
	}
	
	router.Use(middleware.Logger)

	router.Mount("/health", health.Routes())

	router.Route("/api/v1/auth", func(r chi.Router) {
		r.Use(httprate.LimitByIP(10, time.Minute))
		r.Mount("/", auth.Routes())
	})

	router.Route("/api/v1", func(r chi.Router) {
		r.Use(auth.Middleware)

		// All routes below require auth
	})

	if err := http.ListenAndServe(":5000", router); err != nil {
		log.Fatal(err)
	}
}