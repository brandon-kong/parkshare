package main

import (
	"net/http"

	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/brandon-kong/parkshare/apps/api/internal/features/health"
)

func main() {
	router := chi.NewRouter()

	router.Use(middleware.Logger)

	router.Mount("/health", health.Routes())
	http.ListenAndServe(":3000", router)
}