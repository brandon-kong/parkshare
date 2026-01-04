package health

import (
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
		w.Write([]byte(`{"status":"unhealthy","database":"error"}`))
		return
	}
	if err := sqlDB.Ping(); err != nil {
        w.WriteHeader(http.StatusServiceUnavailable)
        w.Write([]byte(`{"status":"unhealthy","database":"disconnected"}`))
        return
    }
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "healthy"}`))
}