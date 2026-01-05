"use client";

import { useCallback, useEffect, useState } from "react";

interface ScrollState {
  isScrolled: boolean;
  scrollY: number;
  scrollDirection: "up" | "down" | null;
}

interface UseScrollOptions {
  threshold?: number;
}

export function useScroll({
  threshold = 10,
}: UseScrollOptions = {}): ScrollState {
  const [scrollState, setScrollState] = useState<ScrollState>({
    isScrolled: false,
    scrollY: 0,
    scrollDirection: null,
  });

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    setScrollState((prev) => ({
      isScrolled: currentScrollY > threshold,
      scrollY: currentScrollY,
      scrollDirection:
        currentScrollY > prev.scrollY
          ? "down"
          : currentScrollY < prev.scrollY
            ? "up"
            : prev.scrollDirection,
    }));
  }, [threshold]);

  useEffect(() => {
    // Set initial state
    handleScroll();

    // Use passive listener for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return scrollState;
}
