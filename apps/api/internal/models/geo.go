package models

import (
    "database/sql/driver"
    "encoding/hex"
    "fmt"

    "github.com/twpayne/go-geom"
    "github.com/twpayne/go-geom/encoding/ewkb"
)

type GeoPoint struct {
    lng float64
    lat float64
}

func NewGeoPoint(lng, lat float64) GeoPoint {
    return GeoPoint{lng: lng, lat: lat}
}

func (g *GeoPoint) Scan(input interface{}) error {
    if input == nil {
        return nil
    }

    var data []byte
    switch v := input.(type) {
    case []byte:
        data = v
    case string:
        var err error
        data, err = hex.DecodeString(v)
        if err != nil {
            return err
        }
    default:
        return fmt.Errorf("unsupported type: %T", input)
    }

    gt, err := ewkb.Unmarshal(data)
    if err != nil {
        return err
    }

    point, ok := gt.(*geom.Point)
    if !ok {
        return nil
    }

    coords := point.Coords()
    g.lng = coords.X()
    g.lat = coords.Y()
    return nil
}

func (g GeoPoint) Value() (driver.Value, error) {
    // Use WKT format with SRID which PostGIS understands natively
    return fmt.Sprintf("SRID=4326;POINT(%f %f)", g.lng, g.lat), nil
}

func (g GeoPoint) Lat() float64 {
    return g.lat
}

func (g GeoPoint) Lng() float64 {
    return g.lng
}