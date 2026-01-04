package models

import (
    "database/sql/driver"

    "github.com/twpayne/go-geom"
    "github.com/twpayne/go-geom/encoding/ewkb"
)

type GeoPoint struct {
    geom.Point
}

func NewGeoPoint(lng, lat float64) GeoPoint {
    return GeoPoint{*geom.NewPoint(geom.XY).MustSetCoords(geom.Coord{lng, lat}).SetSRID(4326)}
}

func (g *GeoPoint) Scan(input interface{}) error {
    if input == nil {
        return nil
    }

    gt, err := ewkb.Unmarshal(input.([]byte))
    if err != nil {
        return err
    }

    point, ok := gt.(*geom.Point)
    if !ok {
        return nil
    }

    g.Point = *point
    return nil
}

func (g GeoPoint) Value() (driver.Value, error) {
    point := g.Point
    point.SetSRID(4326)
    return ewkb.Marshal(&point, ewkb.NDR)
}

func (g GeoPoint) Lat() float64 {
    return g.Point.Y()
}

func (g GeoPoint) Lng() float64 {
    return g.Point.X()
}