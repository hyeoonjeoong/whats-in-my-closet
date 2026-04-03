"use client";

import { RotateCcw } from "lucide-react";
import { Button, IconButton } from "@/components/ui";
import { SEASONS, CATEGORIES } from "@/lib/constants";
import type { Season, Category } from "@/types";

interface FilterBarProps {
  selectedSeasons: Season[];
  selectedCategories: Category[];
  onSeasonToggle: (season: Season) => void;
  onCategoryToggle: (category: Category) => void;
  onReset: () => void;
}

export const FilterBar = ({
  selectedSeasons,
  selectedCategories,
  onSeasonToggle,
  onCategoryToggle,
  onReset,
}: FilterBarProps) => {
  return (
    <div className="space-y-3">
      {/* 계절 필터 */}
      <div className="flex flex-wrap items-center gap-2">
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

      {/* 카테고리 필터 + 초기화 버튼 */}
      <div className="flex flex-wrap items-center gap-2">
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

        <IconButton
          variant="ghost"
          size="sm"
          onClick={onReset}
          aria-label="필터 초기화"
        >
          <RotateCcw size={16} />
        </IconButton>
      </div>
    </div>
  );
};
