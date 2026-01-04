package spot

import (
	"encoding/json"
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
    router.Post("/", Create)
    router.Get("/{id}", Get)
    router.Put("/{id}", Update)
    router.Delete("/{id}", Delete)

	return router
}

func List(w http.ResponseWriter, req *http.Request) {
	claims := auth.GetUserFromContext(req.Context())

	var spots []models.Spot
    database.DB.Where("host_id = ?", claims.UserID).Find(&spots)

    util.WriteJSON(w, http.StatusOK, spots)
}

func Create(w http.ResponseWriter, r *http.Request) {
    claims := auth.GetUserFromContext(r.Context())

    var req CreateSpotRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        util.WriteError(w, http.StatusBadRequest, "Invalid request body")
        return
    }

    spot := &models.Spot{
        HostID:      claims.UserID,
        Title:       req.Title,
        Description: req.Description,
        Address:     req.Address,
        City:        req.City,
        State:       req.State,
        PostalCode:  req.PostalCode,
        Country:     req.Country,
        Latitude:    req.Latitude,
        Longitude:   req.Longitude,
        Location:    models.NewGeoPoint(req.Longitude, req.Latitude),
        SpotType:    req.SpotType,
        VehicleSize: req.VehicleSize,
        HourlyRate:  req.HourlyRate,
        DailyRate:   req.DailyRate,
        MonthlyRate: req.MonthlyRate,
        Status:      models.SpotStatusDraft,
    }

    if err := database.DB.Create(spot).Error; err != nil {
        util.WriteError(w, http.StatusInternalServerError, "Failed to create spot")
        return
    }

    util.WriteJSON(w, http.StatusCreated, spot)
}

func Get(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")

    var spot models.Spot
    if err := database.DB.First(&spot, "id = ?", id).Error; err != nil {
        util.WriteError(w, http.StatusNotFound, "Spot not found")
        return
    }

    util.WriteJSON(w, http.StatusOK, spot)
}

func Update(w http.ResponseWriter, r *http.Request) {
    claims := auth.GetUserFromContext(r.Context())
    id := chi.URLParam(r, "id")

    var spot models.Spot
    if err := database.DB.First(&spot, "id = ?", id).Error; err != nil {
        util.WriteError(w, http.StatusNotFound, "Spot not found")
        return
    }

    // Check ownership
    if spot.HostID != claims.UserID {
        util.WriteError(w, http.StatusForbidden, "You don't own this spot")
        return
    }

    var req UpdateSpotRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        util.WriteError(w, http.StatusBadRequest, "Invalid request body")
        return
    }

    // Update fields
    if err := database.DB.Model(&spot).Updates(req).Error; err != nil {
        util.WriteError(w, http.StatusInternalServerError, "Failed to update spot")
        return
    }

    util.WriteJSON(w, http.StatusOK, spot)
}

func Delete(w http.ResponseWriter, r *http.Request) {
    claims := auth.GetUserFromContext(r.Context())
    id := chi.URLParam(r, "id")

    var spot models.Spot
    if err := database.DB.First(&spot, "id = ?", id).Error; err != nil {
        util.WriteError(w, http.StatusNotFound, "Spot not found")
        return
    }

    // Check ownership
    if spot.HostID != claims.UserID {
        util.WriteError(w, http.StatusForbidden, "You don't own this spot")
        return
    }

    // Soft delete - just change status
    database.DB.Model(&spot).Update("status", models.SpotStatusDeleted)

    util.WriteJSON(w, http.StatusOK, map[string]string{"message": "Spot deleted"})
}

// Request types
type CreateSpotRequest struct {
    Title       string           `json:"title"`
    Description string           `json:"description"`
    Address     string           `json:"address"`
    City        string           `json:"city"`
    State       string           `json:"state"`
    PostalCode  string           `json:"postal_code"`
    Country     string           `json:"country"`
    Latitude    float64          `json:"latitude"`
    Longitude   float64          `json:"longitude"`
    SpotType    models.SpotType  `json:"spot_type"`
    VehicleSize models.VehicleSize `json:"vehicle_size"`
    HourlyRate  *int             `json:"hourly_rate"`
    DailyRate   *int             `json:"daily_rate"`
    MonthlyRate *int             `json:"monthly_rate"`
}

type UpdateSpotRequest struct {
    Title       string `json:"title,omitempty"`
    Description string `json:"description,omitempty"`
}