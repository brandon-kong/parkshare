"use client";

import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

interface DraggableMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  className?: string;
}

export function DraggableMap({
  latitude,
  longitude,
  onLocationChange,
  className = "",
}: DraggableMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);
  const initialCoordsRef = useRef({ latitude, longitude });

  // Keep callback ref up to date
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  const handleDragEnd = useCallback(() => {
    const lngLat = marker.current?.getLngLat();
    if (lngLat) {
      onLocationChangeRef.current(lngLat.lat, lngLat.lng);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.warn("Mapbox access token not configured");
      return;
    }

    mapboxgl.accessToken = token;

    const { latitude: initLat, longitude: initLng } = initialCoordsRef.current;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initLng, initLat],
      zoom: 16,
    });

    // Create draggable marker
    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: "#000000",
    })
      .setLngLat([initLng, initLat])
      .addTo(map.current);

    // Handle marker drag end
    marker.current.on("dragend", handleDragEnd);

    // Add zoom controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
    };
  }, [handleDragEnd]);

  // Update marker and map center when coordinates change from outside
  useEffect(() => {
    if (marker.current && map.current) {
      marker.current.setLngLat([longitude, latitude]);
      map.current.flyTo({
        center: [longitude, latitude],
        duration: 500,
      });
    }
  }, [latitude, longitude]);

  return (
    <div
      ref={mapContainer}
      className={`w-full h-64 rounded-xl overflow-hidden ${className}`}
    />
  );
}
