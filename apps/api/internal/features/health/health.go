package health

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func Routes() chi.Router {
	router := chi.NewRouter()
	router.Get("/", Check)
	return router
}

func Check(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status": "healthy"}`))
}