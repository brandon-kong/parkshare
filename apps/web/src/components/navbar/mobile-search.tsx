"use client";

import { Navigation, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import {
  LocationAutocomplete,
  type LocationResult,
} from "../ui/location-autocomplete";

interface SearchState {
  location: string;
  coordinates: { longitude: number; latitude: number } | null;
}

export function MobileSearch() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchState, setSearchState] = useState<SearchState>({
    location: "",
    coordinates: null,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch user's approximate location on mount
  useEffect(() => {
    async function fetchLocation() {
      try {
        // First get client's public IP using a CORS-friendly service
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const { ip } = await ipResponse.json();

        // Then pass IP to our API route which calls ipinfo.io
        const response = await fetch(`/api/location?ip=${ip}`);
        const data = await response.json();

        if (data.formatted && data.latitude && data.longitude) {
          setSearchState({
            location: data.formatted,
            coordinates: { latitude: data.latitude, longitude: data.longitude },
          });
        }
      } catch (error) {
        console.error("Failed to fetch location:", error);
      }
    }
    fetchLocation();
  }, []);

  // Prevent body scroll when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isExpanded]);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (searchState.location) params.set("location", searchState.location);
    if (searchState.coordinates) {
      params.set("lat", searchState.coordinates.latitude.toString());
      params.set("lng", searchState.coordinates.longitude.toString());
    }

    const queryString = params.toString();
    router.push(`/search${queryString ? `?${queryString}` : ""}`);
    setIsExpanded(false);
  }, [searchState, router]);

  const handleLocationSelect = useCallback((location: LocationResult) => {
    setSearchState({
      location: location.fullAddress,
      coordinates: location.coordinates,
    });
  }, []);

  const [isLocating, setIsLocating] = useState(false);

  const handleNearbyClick = useCallback(async () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

        if (token) {
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&types=place,locality,neighborhood`,
            );
            const data = await response.json();
            const place = data.features?.[0];

            setSearchState({
              location: place?.place_name || "Current location",
              coordinates: { longitude, latitude },
            });
          } catch {
            setSearchState({
              location: "Current location",
              coordinates: { longitude, latitude },
            });
          }
        } else {
          setSearchState({
            location: "Current location",
            coordinates: { longitude, latitude },
          });
        }

        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  // Collapsed state
  if (!isExpanded) {
    return (
      <Button
        variant="secondary"
        onClick={() => setIsExpanded(true)}
        startIcon={<Search size={20} />}
        className="w-full justify-start gap-3 h-auto py-3"
      >
        <div className="flex-1 text-left">
          <p className="text-sm font-medium">
            {searchState.location || "Where do you need parking?"}
          </p>
        </div>
      </Button>
    );
  }

  // Expanded state - Full screen modal
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[100] bg-background animate-in fade-in duration-200">
      <div ref={containerRef} className="w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(false)}
            className="-ml-2"
          >
            <X size={20} />
          </Button>
          <span className="font-semibold">Find parking</span>
          <div className="w-10" />
        </div>

        {/* Search fields */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            <LocationAutocomplete
              label="Where do you need parking?"
              placeholder="Enter address, city, or venue"
              value={searchState.location}
              onChange={(value) =>
                setSearchState((s) => ({ ...s, location: value }))
              }
              onSelect={handleLocationSelect}
              variant="accent"
            />
            <div className="flex gap-2">
              <Button
                variant={
                  searchState.location === "Current location"
                    ? "primary"
                    : "secondary"
                }
                size="sm"
                onClick={handleNearbyClick}
                loading={isLocating}
                startIcon={<Navigation size={14} />}
              >
                Nearby
              </Button>
            </div>
          </div>
        </div>

        {/* Footer with search button */}
        <div className="p-4 border-t border-border bg-background">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSearch}
            startIcon={<Search size={20} />}
            className="w-full"
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
