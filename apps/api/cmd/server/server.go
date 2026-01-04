package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"

	"github.com/brandon-kong/parkshare/apps/api/internal/database"
	"github.com/brandon-kong/parkshare/apps/api/internal/features/auth"
	"github.com/brandon-kong/parkshare/apps/api/internal/features/health"
	"github.com/brandon-kong/parkshare/apps/api/internal/features/spot"
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

	// Middleware
	if useCors := os.Getenv("USE_CORS"); useCors == "true" {
		log.Printf("Using CORS\n")
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
		r.Mount("/spots", spot.Routes())
	})
	
	if err := http.ListenAndServe(":5000", router); err != nil {
		log.Fatal(err)
	}
}