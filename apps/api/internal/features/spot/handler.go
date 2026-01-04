package spot

import (
	"net/http"

	"github.com/brandon-kong/parkshare/apps/api/internal/database"
	"github.com/brandon-kong/parkshare/apps/api/internal/features/auth"
	"github.com/brandon-kong/parkshare/apps/api/internal/models"
	"github.com/brandon-kong/parkshare/apps/api/util"
	"github.com/go-chi/chi/v5"
)

func Routes() chi.Router {
	router := chi.NewRouter()

	router.Get("/", List)

	return router
}

func List(w http.ResponseWriter, req *http.Request) {
	claims := auth.GetUserFromContext(req.Context())

	var spots []models.Spot
    database.DB.Where("host_id = ?", claims.UserID).Find(&spots)

    util.WriteJSON(w, http.StatusAccepted, spots)
}