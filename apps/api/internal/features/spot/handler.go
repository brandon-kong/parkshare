package spot

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/brandon-kong/parkshare/apps/api/internal/database"
	"github.com/brandon-kong/parkshare/apps/api/internal/features/auth"
	"github.com/brandon-kong/parkshare/apps/api/internal/models"
	"github.com/brandon-kong/parkshare/apps/api/util"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func Routes() chi.Router {
	router := chi.NewRouter()

	router.Get("/", List)
	router.Post("/", Create)
	router.Get("/{id}", Get)
	router.Put("/{id}", Update)
	router.Delete("/{id}", Delete)
	router.Post("/{id}/photos", UploadPhotos)

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

    // Validate coordinates
    if req.Latitude < -90 || req.Latitude > 90 {
        util.WriteError(w, http.StatusBadRequest, "Invalid latitude")
        return
    }
    if req.Longitude < -180 || req.Longitude > 180 {
        util.WriteError(w, http.StatusBadRequest, "Invalid longitude")
        return
    }

    spot := &models.Spot{
        HostID:             claims.UserID,
        Title:              req.Title,
        Description:        req.Description,
        Address:            req.Address,
        City:               req.City,
        State:              req.State,
        PostalCode:         req.PostalCode,
        Country:            req.Country,
        Latitude:           req.Latitude,
        Longitude:          req.Longitude,
        Location:           models.NewGeoPoint(req.Longitude, req.Latitude),
        SpotType:           req.SpotType,
        VehicleSize:        req.VehicleSize,
        IsCovered:          req.IsCovered,
        HasEVCharging:      req.HasEVCharging,
        HasSecurity:        req.HasSecurity,
        AccessInstructions: req.AccessInstructions,
        HourlyRate:         req.HourlyRate,
        DailyRate:          req.DailyRate,
        MonthlyRate:        req.MonthlyRate,
        Status:             models.SpotStatusDraft,
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

func UploadPhotos(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetUserFromContext(r.Context())
	spotID := chi.URLParam(r, "id")

	// Verify spot exists and user owns it
	var spot models.Spot
	if err := database.DB.First(&spot, "id = ?", spotID).Error; err != nil {
		util.WriteError(w, http.StatusNotFound, "Spot not found")
		return
	}

	if spot.HostID != claims.UserID {
		util.WriteError(w, http.StatusForbidden, "You don't own this spot")
		return
	}

	// Parse multipart form (max 50MB total)
	if err := r.ParseMultipartForm(50 << 20); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Failed to parse form data")
		return
	}

	files := r.MultipartForm.File["photos"]
	if len(files) == 0 {
		util.WriteError(w, http.StatusBadRequest, "No photos provided")
		return
	}

	// Create uploads directory if it doesn't exist
	uploadsDir := filepath.Join("uploads", "spots", spotID)
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to create upload directory")
		return
	}

	// Get current photo count for ordering
	var existingCount int64
	database.DB.Model(&models.SpotPhoto{}).Where("spot_id = ?", spotID).Count(&existingCount)

	var uploadedPhotos []models.SpotPhoto

	for i, fileHeader := range files {
		// Validate file type
		contentType := fileHeader.Header.Get("Content-Type")
		if !strings.HasPrefix(contentType, "image/") {
			continue
		}

		// Open the uploaded file
		file, err := fileHeader.Open()
		if err != nil {
			continue
		}
		defer file.Close()

		// Generate unique filename
		ext := filepath.Ext(fileHeader.Filename)
		if ext == "" {
			ext = ".jpg"
		}
		filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
		filePath := filepath.Join(uploadsDir, filename)

		// Create destination file
		dst, err := os.Create(filePath)
		if err != nil {
			continue
		}
		defer dst.Close()

		// Copy file contents
		if _, err := io.Copy(dst, file); err != nil {
			os.Remove(filePath)
			continue
		}

		// Create photo record
		photo := models.SpotPhoto{
			SpotID:       spot.ID,
			URL:          fmt.Sprintf("/uploads/spots/%s/%s", spotID, filename),
			DisplayOrder: int(existingCount) + i,
		}

		if err := database.DB.Create(&photo).Error; err != nil {
			os.Remove(filePath)
			continue
		}

		uploadedPhotos = append(uploadedPhotos, photo)
	}

	if len(uploadedPhotos) == 0 {
		util.WriteError(w, http.StatusBadRequest, "No photos were uploaded successfully")
		return
	}

	util.WriteJSON(w, http.StatusCreated, uploadedPhotos)
}

// Request types
type CreateSpotRequest struct {
    Title              string             `json:"title"`
    Description        string             `json:"description"`
    Address            string             `json:"address"`
    City               string             `json:"city"`
    State              string             `json:"state"`
    PostalCode         string             `json:"postal_code"`
    Country            string             `json:"country"`
    Latitude           float64            `json:"latitude"`
    Longitude          float64            `json:"longitude"`
    SpotType           models.SpotType    `json:"spot_type"`
    VehicleSize        models.VehicleSize `json:"vehicle_size"`
    IsCovered          bool               `json:"is_covered"`
    HasEVCharging      bool               `json:"has_ev_charging"`
    HasSecurity        bool               `json:"has_security"`
    AccessInstructions *string            `json:"access_instructions"`
    HourlyRate         *int               `json:"hourly_rate"`
    DailyRate          *int               `json:"daily_rate"`
    MonthlyRate        *int               `json:"monthly_rate"`
}

type UpdateSpotRequest struct {
    Title       string `json:"title,omitempty"`
    Description string `json:"description,omitempty"`
}