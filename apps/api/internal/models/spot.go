package models

import (
    "time"

    "github.com/google/uuid"
)

type SpotType string

const (
    SpotTypeDriveway SpotType = "driveway"
    SpotTypeGarage   SpotType = "garage"
    SpotTypeLot      SpotType = "lot"
    SpotTypeStreet   SpotType = "street"
)

type VehicleSize string

const (
    VehicleSizeCompact   VehicleSize = "compact"
    VehicleSizeStandard  VehicleSize = "standard"
    VehicleSizeLarge     VehicleSize = "large"
    VehicleSizeOversized VehicleSize = "oversized"
)

type SpotStatus string

const (
    SpotStatusDraft   SpotStatus = "draft"
    SpotStatusActive  SpotStatus = "active"
    SpotStatusPaused  SpotStatus = "paused"
    SpotStatusDeleted SpotStatus = "deleted"
)

type Spot struct {
    ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
    HostID      uuid.UUID `gorm:"type:uuid;not null" json:"host_id"`
    Host        User      `gorm:"foreignKey:HostID" json:"host,omitempty"`
    Title       string    `gorm:"not null" json:"title"`
    Description string    `json:"description"`

    // Location
    Address    string   `gorm:"not null" json:"address"`
    City       string   `gorm:"not null" json:"city"`
    State      string   `json:"state"`
    PostalCode string   `json:"postal_code"`
    Country    string   `gorm:"not null;default:'US'" json:"country"`
    Latitude   float64  `gorm:"not null" json:"latitude"`
    Longitude  float64  `gorm:"not null" json:"longitude"`
    Location   GeoPoint `gorm:"type:geography(POINT,4326)" json:"-"`

    // Attributes
    SpotType           SpotType    `gorm:"type:varchar(20);not null;default:'driveway'" json:"spot_type"`
    VehicleSize        VehicleSize `gorm:"type:varchar(20);not null;default:'standard'" json:"vehicle_size"`
    IsCovered          bool        `gorm:"default:false" json:"is_covered"`
    HasEVCharging      bool        `gorm:"default:false" json:"has_ev_charging"`
    HasSecurity        bool        `gorm:"default:false" json:"has_security"`
    AccessInstructions *string     `json:"access_instructions,omitempty"`

    // Pricing (in cents)
    HourlyRate  *int `json:"hourly_rate,omitempty"`
    DailyRate   *int `json:"daily_rate,omitempty"`
    MonthlyRate *int `json:"monthly_rate,omitempty"`

    // Status
    Status SpotStatus `gorm:"type:varchar(20);not null;default:'draft'" json:"status"`

    // Timestamps
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`

    // Relations
    Photos []SpotPhoto `gorm:"foreignKey:SpotID" json:"photos,omitempty"`
}

type SpotPhoto struct {
    ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
    SpotID       uuid.UUID `gorm:"type:uuid;not null" json:"spot_id"`
    URL          string    `gorm:"not null" json:"url"`
    DisplayOrder int       `gorm:"default:0" json:"display_order"`
    CreatedAt    time.Time `json:"created_at"`
}