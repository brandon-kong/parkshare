"use client";

import { Calendar, Clock, MapPin, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface SearchState {
  location: string;
  date: string;
  duration: string;
}

export function MobileSearch() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchState, setSearchState] = useState<SearchState>({
    location: "",
    date: "",
    duration: "",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    if (searchState.date) params.set("date", searchState.date);
    if (searchState.duration) params.set("duration", searchState.duration);

    const queryString = params.toString();
    router.push(`/search${queryString ? `?${queryString}` : ""}`);
    setIsExpanded(false);
  }, [searchState, router]);

  const hasSearchValues =
    searchState.location || searchState.date || searchState.duration;

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
            {hasSearchValues ? searchState.location || "Anywhere" : "Where to?"}
          </p>
          <p className="text-xs text-muted-foreground font-normal">
            {hasSearchValues
              ? [searchState.date, searchState.duration]
                  .filter(Boolean)
                  .join(" · ") || "Any time"
              : "Any time · Any duration"}
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
          <span className="font-semibold">Search parking</span>
          <div className="w-10" />
        </div>

        {/* Search fields */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Location */}
          <Input
            label="Where"
            placeholder="Enter address, city, or venue"
            value={searchState.location}
            onChange={(e) =>
              setSearchState((s) => ({ ...s, location: e.target.value }))
            }
            startIcon={<MapPin size={18} />}
            variant="accent"
          />

          {/* Date */}
          <div className="space-y-2">
            <Input
              label="When"
              placeholder="Today, Tomorrow, or specific date"
              value={searchState.date}
              onChange={(e) =>
                setSearchState((s) => ({ ...s, date: e.target.value }))
              }
              startIcon={<Calendar size={18} />}
              variant="accent"
            />
            <div className="flex gap-2 flex-wrap">
              {["Today", "Tomorrow", "This weekend"].map((option) => (
                <Button
                  key={option}
                  variant={
                    searchState.date === option ? "primary" : "secondary"
                  }
                  size="sm"
                  onClick={() =>
                    setSearchState((s) => ({ ...s, date: option }))
                  }
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Input
              label="Duration"
              placeholder="e.g., 2 hours, All day"
              value={searchState.duration}
              onChange={(e) =>
                setSearchState((s) => ({ ...s, duration: e.target.value }))
              }
              startIcon={<Clock size={18} />}
              variant="accent"
            />
            <div className="flex gap-2 flex-wrap">
              {["1 hour", "2 hours", "4 hours", "All day"].map((option) => (
                <Button
                  key={option}
                  variant={
                    searchState.duration === option ? "primary" : "secondary"
                  }
                  size="sm"
                  onClick={() =>
                    setSearchState((s) => ({ ...s, duration: option }))
                  }
                >
                  {option}
                </Button>
              ))}
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
