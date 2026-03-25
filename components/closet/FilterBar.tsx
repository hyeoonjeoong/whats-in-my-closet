"use client";

import { cn } from "@/lib/utils";
import { SEASONS, CATEGORIES } from "@/lib/constants";
import type { Season, Category } from "@/types";

interface FilterBarProps {
  selectedSeasons: Season[];
  selectedCategories: Category[];
  onSeasonToggle: (season: Season) => void;
  onCategoryToggle: (category: Category) => void;
}

export function FilterBar({
  selectedSeasons,
  selectedCategories,
  onSeasonToggle,
  onCategoryToggle,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      {/* 계절 필터 */}
      <div className="flex flex-wrap gap-2">
        {SEASONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onSeasonToggle(value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              selectedSeasons.includes(value)
                ? "bg-primary text-white"
                : "bg-secondary-3 text-primary"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onCategoryToggle(value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              selectedCategories.includes(value)
                ? "bg-primary text-white"
                : "bg-secondary-2 text-primary"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
