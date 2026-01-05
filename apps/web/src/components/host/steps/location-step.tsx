"use client";

import { MapPin } from "lucide-react";
import { DraggableMap } from "@/components/ui/draggable-map";
import {
  LocationAutocomplete,
  type LocationResult,
} from "@/components/ui/location-autocomplete";
import { Typography } from "@/components/ui/typography";

interface LocationData {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

interface LocationStepProps {
  location: LocationData;
  onLocationChange: (location: LocationData) => void;
  errors?: {
    address?: string;
  };
}

export function LocationStep({
  location,
  onLocationChange,
  errors,
}: LocationStepProps) {
  const handleLocationSelect = (result: LocationResult) => {
    // Parse the full address to extract components
    const parts = result.fullAddress.split(", ");

    onLocationChange({
      address: result.fullAddress,
      city: parts[1] || "",
      state: parts[2]?.split(" ")[0] || "",
      postalCode: parts[2]?.split(" ")[1] || "",
      country: parts[3] || "United States",
      latitude: result.coordinates.latitude,
      longitude: result.coordinates.longitude,
    });
  };

  const handleMapLocationChange = (lat: number, lng: number) => {
    onLocationChange({
      ...location,
      latitude: lat,
      longitude: lng,
    });
  };

  const hasValidLocation =
    location.latitude !== null && location.longitude !== null;

  return (
    <div className="space-y-6">
      <Typography variant="h3">Where is your parking spot located?</Typography>

      <LocationAutocomplete
        label="Address"
        placeholder="Enter the street address"
        value={location.address}
        onChange={(value) =>
          onLocationChange({
            ...location,
            address: value,
            latitude: null,
            longitude: null,
          })
        }
        onSelect={handleLocationSelect}
        variant="accent"
      />

      {errors?.address && (
        <p className="text-sm text-destructive">{errors.address}</p>
      )}

      {/* Interactive Map */}
      {location.latitude !== null && location.longitude !== null && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Drag the marker to adjust the exact location
          </p>
          <DraggableMap
            latitude={location.latitude}
            longitude={location.longitude}
            onLocationChange={handleMapLocationChange}
            className="border border-border"
          />
        </div>
      )}

      {/* Address Details */}
      {hasValidLocation && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/50">
          <MapPin size={20} className="mt-0.5 text-muted-foreground shrink-0" />
          <div className="text-sm">
            <p className="font-medium">{location.address.split(",")[0]}</p>
            <p className="text-muted-foreground">
              {location.city}
              {location.state && `, ${location.state}`}
              {location.postalCode && ` ${location.postalCode}`}
            </p>
            {location.country && (
              <p className="text-muted-foreground">{location.country}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
