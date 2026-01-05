"use client";

import { Navigation, Search } from "lucide-react";
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

interface ExpandableSearchProps {
  isScrolled?: boolean;
}

export function ExpandableSearch({
  isScrolled = false,
}: ExpandableSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchState, setSearchState] = useState<SearchState>({
    location: "",
    coordinates: null,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
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

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    }

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExpanded]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isExpanded]);

  const handleExpand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (searchState.location) params.set("location", searchState.location);
    if (searchState.coordinates) {
      params.set("lat", searchState.coordinates.latitude.toString());
      params.set("lng", searchState.coordinates.longitude.toString());
    }

    const queryString = params.toString();
    router.push(`/s/spots${queryString ? `?${queryString}` : ""}`);
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

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Collapsed state - Search bar */}
      <button
        type="button"
        tabIndex={isExpanded ? -1 : 0}
        aria-label="Search for parking"
        aria-expanded={isExpanded}
        onClick={handleExpand}
        className={`group flex items-center gap-2 bg-background border border-border rounded-full shadow-sm cursor-pointer transition-all duration-300 ease-out hover:shadow-md w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isScrolled ? "h-10 px-2" : "h-12 px-3"} ${isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        {/* Search icon */}
        <div
          className={`flex items-center justify-center text-muted-foreground ${isScrolled ? "w-6 h-6" : "w-8 h-8"}`}
        >
          <Search size={isScrolled ? 16 : 18} />
        </div>

        {/* Location text */}
        <div className="flex-1">
          <span
            className={`text-sm font-medium ${searchState.location ? "text-foreground" : "text-muted-foreground"}`}
          >
            {searchState.location || "Where do you need parking?"}
          </span>
        </div>

        {/* Search trigger */}
        <span
          role="none"
          onClick={(e) => {
            e.stopPropagation();
            handleSearch();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              handleSearch();
            }
          }}
          className={`inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0 ${isScrolled ? "h-8 w-8 -mr-1" : "h-10 w-10 -mr-2"}`}
        >
          <Search size={isScrolled ? 14 : 16} />
        </span>
      </button>

      {/* Expanded dropdown */}
      {isExpanded && (
        <div
          role="dialog"
          aria-label="Search for parking location"
          className="absolute top-0 left-0 z-50 bg-background border border-border rounded-3xl shadow-xl overflow-hidden w-full animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="p-4 space-y-3">
            <LocationAutocomplete
              ref={inputRef}
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

          {/* Search button */}
          <div className="px-4 pb-4">
            <Button
              variant="primary"
              onClick={handleSearch}
              startIcon={<Search size={18} />}
              className="w-full"
            >
              Search
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
