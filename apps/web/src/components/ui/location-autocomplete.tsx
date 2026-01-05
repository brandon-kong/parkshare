"use client";

import { MapPin } from "lucide-react";
import {
  forwardRef,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Input } from "./input";

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  place_type: string[];
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

interface MapboxResponse {
  features: MapboxFeature[];
}

export interface LocationResult {
  id: string;
  name: string;
  fullAddress: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (location: LocationResult) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  variant?: "default" | "accent";
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export const LocationAutocomplete = forwardRef<
  HTMLInputElement,
  LocationAutocompleteProps
>(
  (
    {
      value,
      onChange,
      onSelect,
      label,
      placeholder = "Enter address, city, or venue",
      className = "",
      variant = "default",
    },
    ref,
  ) => {
    const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const listboxId = "location-autocomplete-listbox";
    const [dropdownPosition, setDropdownPosition] = useState<{
      top: number;
      left: number;
      width: number;
    } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputWrapperRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const fetchSuggestions = useCallback(async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      if (!MAPBOX_TOKEN) {
        console.warn("Mapbox access token not configured");
        return;
      }

      setIsLoading(true);

      try {
        const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
        const params = new URLSearchParams({
          access_token: MAPBOX_TOKEN,
          types: "address,poi,place,locality,neighborhood",
          limit: "5",
          language: "en",
        });

        const response = await fetch(`${endpoint}?${params}`);
        const data: MapboxResponse = await response.json();

        setSuggestions(data.features || []);
        setIsOpen(data.features?.length > 0);
        setActiveIndex(-1);
      } catch (error) {
        console.error("Failed to fetch location suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        fetchSuggestions(newValue);
      }, 300);
    };

    const handleSelect = (feature: MapboxFeature) => {
      const location: LocationResult = {
        id: feature.id,
        name: feature.text,
        fullAddress: feature.place_name,
        coordinates: {
          longitude: feature.center[0],
          latitude: feature.center[1],
        },
      };

      onChange(feature.place_name);
      setSuggestions([]);
      setIsOpen(false);
      onSelect?.(location);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || suggestions.length === 0) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && suggestions[activeIndex]) {
            handleSelect(suggestions[activeIndex]);
          }
          break;
        case "Tab":
          if (e.shiftKey) {
            // Shift+Tab should close dropdown and go to previous element
            setIsOpen(false);
            setActiveIndex(-1);
            break;
          }
          // If dropdown is open with suggestions
          if (suggestions.length > 0) {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < suggestions.length - 1) {
              // Move to next suggestion
              setActiveIndex(activeIndex + 1);
            } else if (activeIndex === suggestions.length - 1) {
              // At last suggestion, select it and close
              const lastSuggestion = suggestions[activeIndex];
              if (lastSuggestion) {
                handleSelect(lastSuggestion);
              }
            } else {
              // No active selection, highlight first suggestion
              setActiveIndex(0);
            }
          }
          // If no suggestions, let Tab proceed normally
          break;
        case "Escape":
          setIsOpen(false);
          setActiveIndex(-1);
          break;
      }
    };

    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        const target = e.target as Node;
        const isInsideContainer = containerRef.current?.contains(target);
        const isInsideDropdown = dropdownRef.current?.contains(target);

        if (!isInsideContainer && !isInsideDropdown) {
          setIsOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, []);

    // Calculate dropdown position when open
    useEffect(() => {
      if (isOpen && inputWrapperRef.current) {
        const rect = inputWrapperRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }, [isOpen]);

    const getSecondaryText = (feature: MapboxFeature) => {
      if (feature.context && feature.context.length > 0) {
        return feature.context.map((c) => c.text).join(", ");
      }
      const parts = feature.place_name.split(", ");
      return parts.slice(1).join(", ");
    };

    const getOptionId = (index: number) => `${listboxId}-option-${index}`;

    const dropdown =
      isOpen && suggestions.length > 0 && dropdownPosition
        ? createPortal(
            <div
              ref={dropdownRef}
              id={listboxId}
              role="listbox"
              aria-label="Location suggestions"
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              }}
              className="bg-background border border-border rounded-lg shadow-lg overflow-hidden z-[200] animate-in fade-in slide-in-from-top-1 duration-150"
            >
              {suggestions.map((feature, index) => (
                <div
                  key={feature.id}
                  id={getOptionId(index)}
                  role="option"
                  tabIndex={0}
                  aria-selected={index === activeIndex}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(feature);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                    index === activeIndex ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                >
                  <MapPin
                    size={16}
                    className="mt-0.5 text-muted-foreground shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {feature.text}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {getSecondaryText(feature)}
                    </p>
                  </div>
                </div>
              ))}
            </div>,
            document.body,
          )
        : null;

    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <div ref={inputWrapperRef} className="relative">
          <Input
            ref={ref}
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            startIcon={<MapPin size={18} />}
            variant={variant}
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-controls={isOpen ? listboxId : undefined}
            aria-activedescendant={
              isOpen && activeIndex >= 0 ? getOptionId(activeIndex) : undefined
            }
          />
          {isLoading && (
            <div className="absolute right-3 bottom-0 h-[var(--height-btn)] flex items-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          )}
        </div>

        {dropdown}
      </div>
    );
  },
);

LocationAutocomplete.displayName = "LocationAutocomplete";
