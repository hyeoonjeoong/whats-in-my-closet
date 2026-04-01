"use client";

import { Button } from "@/components/ui";
import { SEASONS, CATEGORIES } from "@/lib/constants";
import type { Season, Category } from "@/types";

interface FilterBarProps {
  selectedSeasons: Season[];
  selectedCategories: Category[];
  onSeasonToggle: (season: Season) => void;
  onCategoryToggle: (category: Category) => void;
}

export const FilterBar = ({
  selectedSeasons,
  selectedCategories,
  onSeasonToggle,
  onCategoryToggle,
}: FilterBarProps) => {
  return (
    <div className="space-y-3">
      {/* 계절 필터 */}
      <div className="flex flex-wrap gap-2">
        {SEASONS.map(({ value, label }) => (
          <Button
            key={value}
            variant="chip"
            selected={selectedSeasons.includes(value)}
            onClick={() => onSeasonToggle(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ value, label }) => (
          <Button
            key={value}
            variant="chip"
            selected={selectedCategories.includes(value)}
            onClick={() => onCategoryToggle(value)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};
