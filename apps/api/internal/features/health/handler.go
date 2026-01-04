package health

import (
	"log"
	"net/http"

	"github.com/brandon-kong/parkshare/apps/api/internal/database"
	"github.com/go-chi/chi/v5"
)

func Routes() chi.Router {
	router := chi.NewRouter()
	router.Get("/", Check)
	return router
}

func Check(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	sqlDB, err := database.DB.DB()
	if err != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		_, err := w.Write([]byte(`{"status":"unhealthy","database":"error"}`))
		if err != nil {
			log.Printf("error writing to response: %s", err)
		}
		return
	}
	if err := sqlDB.Ping(); err != nil {
        w.WriteHeader(http.StatusServiceUnavailable)
        _, err := w.Write([]byte(`{"status":"unhealthy","database":"disconnected"}`))
		if err != nil {
			log.Printf("error writing to response: %s", err)
		}
        return
    }
	w.WriteHeader(http.StatusOK)
	_, err = w.Write([]byte(`{"status": "healthy"}`))
	if err != nil {
		log.Printf("error writing to response: %s", err)
	}
}