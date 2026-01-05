"use client";

import { Calendar, Clock, MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type SearchTab = "location" | "date" | "duration";

interface SearchState {
  location: string;
  date: string;
  duration: string;
}

interface ExpandableSearchProps {
  isScrolled?: boolean;
}

export function ExpandableSearch({
  isScrolled = false,
}: ExpandableSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>("location");
  const [searchState, setSearchState] = useState<SearchState>({
    location: "",
    date: "",
    duration: "",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Record<SearchTab, HTMLInputElement | null>>({
    location: null,
    date: null,
    duration: null,
  });
  const router = useRouter();

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

  // Focus input when tab changes or when expanded
  useEffect(() => {
    if (isExpanded && inputRefs.current[activeTab]) {
      setTimeout(() => {
        inputRefs.current[activeTab]?.focus();
      }, 50);
    }
  }, [activeTab, isExpanded]);

  const handleExpand = useCallback((tab: SearchTab = "location") => {
    setIsExpanded(true);
    setActiveTab(tab);
  }, []);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (searchState.location) params.set("location", searchState.location);
    if (searchState.date) params.set("date", searchState.date);
    if (searchState.duration) params.set("duration", searchState.duration);

    const queryString = params.toString();
    router.push(`/search${queryString ? `?${queryString}` : ""}`);
    setIsExpanded(false);
  }, [searchState, router]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setIsExpanded(false);
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const tabs: SearchTab[] = ["location", "date", "duration"];
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      const nextTab = tabs[nextIndex];
      if (nextTab) {
        setActiveTab(nextTab);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Collapsed state - Search bar */}
      <search
        className={`group flex items-center gap-2 bg-background border border-border rounded-full shadow-sm cursor-pointer transition-all duration-300 ease-out hover:shadow-md ${isScrolled ? "h-10 px-2" : "h-12 px-3"} ${isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        {/* Search icon */}
        <div
          className={`flex items-center justify-center text-muted-foreground ${isScrolled ? "w-6 h-6" : "w-8 h-8"}`}
        >
          <Search size={isScrolled ? 16 : 18} />
        </div>

        {/* Pills */}
        <div className="flex-1 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExpand("location")}
            className={`h-auto py-1 px-2 font-medium hover:bg-transparent hover:text-primary ${searchState.location ? "text-foreground" : "text-muted-foreground"}`}
          >
            {searchState.location || "Anywhere"}
          </Button>

          <span className="w-px h-4 bg-border" aria-hidden="true" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExpand("date")}
            className={`h-auto py-1 px-2 font-medium hover:bg-transparent hover:text-primary ${searchState.date ? "text-foreground" : "text-muted-foreground"}`}
          >
            {searchState.date || "Any date"}
          </Button>

          <span className="w-px h-4 bg-border" aria-hidden="true" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExpand("duration")}
            className={`h-auto py-1 px-2 font-medium hover:bg-transparent hover:text-primary ${searchState.duration ? "text-foreground" : "text-muted-foreground"}`}
          >
            {searchState.duration || "Any duration"}
          </Button>
        </div>

        {/* Search button */}
        <Button
          size="icon"
          onClick={handleSearch}
          className={isScrolled ? "h-7 w-7 -mr-1.5" : "h-8 w-8 -mr-2"}
          aria-label="Search"
        >
          <Search size={isScrolled ? 14 : 16} />
        </Button>
      </search>

      {/* Expanded dropdown */}
      {isExpanded && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-background border border-border rounded-3xl shadow-xl overflow-hidden w-[500px] animate-in fade-in zoom-in-95 duration-200">
          {/* Tab headers */}
          <div className="flex border-b border-border">
            <SearchTabButton
              icon={<MapPin size={16} />}
              label="Location"
              isActive={activeTab === "location"}
              onClick={() => setActiveTab("location")}
              hasValue={!!searchState.location}
            />
            <SearchTabButton
              icon={<Calendar size={16} />}
              label="Date"
              isActive={activeTab === "date"}
              onClick={() => setActiveTab("date")}
              hasValue={!!searchState.date}
            />
            <SearchTabButton
              icon={<Clock size={16} />}
              label="Duration"
              isActive={activeTab === "duration"}
              onClick={() => setActiveTab("duration")}
              hasValue={!!searchState.duration}
            />
          </div>

          {/* Tab content */}
          <div className="p-4">
            {activeTab === "location" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-200">
                <Input
                  ref={(el) => {
                    inputRefs.current.location = el;
                  }}
                  label="Where do you need parking?"
                  placeholder="Enter address, city, or venue"
                  value={searchState.location}
                  onChange={(e) =>
                    setSearchState((s) => ({ ...s, location: e.target.value }))
                  }
                  onKeyDown={handleKeyDown}
                  startIcon={<MapPin size={18} />}
                  variant="accent"
                />
              </div>
            )}

            {activeTab === "date" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-200">
                <Input
                  ref={(el) => {
                    inputRefs.current.date = el;
                  }}
                  label="When do you need it?"
                  placeholder="Today, Tomorrow, or specific date"
                  value={searchState.date}
                  onChange={(e) =>
                    setSearchState((s) => ({ ...s, date: e.target.value }))
                  }
                  onKeyDown={handleKeyDown}
                  startIcon={<Calendar size={18} />}
                  variant="accent"
                />
                <div className="flex gap-2">
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
            )}

            {activeTab === "duration" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-200">
                <Input
                  ref={(el) => {
                    inputRefs.current.duration = el;
                  }}
                  label="How long do you need it?"
                  placeholder="e.g., 2 hours, All day"
                  value={searchState.duration}
                  onChange={(e) =>
                    setSearchState((s) => ({ ...s, duration: e.target.value }))
                  }
                  onKeyDown={handleKeyDown}
                  startIcon={<Clock size={18} />}
                  variant="accent"
                />
                <div className="flex gap-2 flex-wrap">
                  {["1 hour", "2 hours", "4 hours", "All day", "Overnight"].map(
                    (option) => (
                      <Button
                        key={option}
                        variant={
                          searchState.duration === option
                            ? "primary"
                            : "secondary"
                        }
                        size="sm"
                        onClick={() =>
                          setSearchState((s) => ({ ...s, duration: option }))
                        }
                      >
                        {option}
                      </Button>
                    ),
                  )}
                </div>
              </div>
            )}
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

interface SearchTabButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  hasValue: boolean;
}

function SearchTabButton({
  icon,
  label,
  isActive,
  onClick,
  hasValue,
}: SearchTabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors relative ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
    >
      <span className={hasValue ? "text-primary" : ""}>{icon}</span>
      <span>{label}</span>
      {hasValue && (
        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
      )}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1 duration-200" />
      )}
    </button>
  );
}
