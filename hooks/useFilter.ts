"use client";

import { useState, useCallback } from "react";
import type { Season, Category, FilterState } from "@/types";

export function useFilter() {
  const [filters, setFilters] = useState<FilterState>({
    seasons: [],
    categories: [],
  });

  const toggleSeason = useCallback((season: Season) => {
    setFilters((prev) => ({
      ...prev,
      seasons: prev.seasons.includes(season)
        ? prev.seasons.filter((s) => s !== season)
        : [...prev.seasons, season],
    }));
  }, []);

  const toggleCategory = useCallback((category: Category) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ seasons: [], categories: [] });
  }, []);

  return {
    filters,
    toggleSeason,
    toggleCategory,
    resetFilters,
  };
}
