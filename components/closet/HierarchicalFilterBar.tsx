"use client";

import { RotateCcw } from "lucide-react";
import { Button, IconButton } from "@/components/ui";
import { SEASONS, MAIN_CATEGORIES, CATEGORY_HIERARCHY } from "@/lib/constants";
import type { Season, MainCategory, SubCategory } from "@/types";
import { cn } from "@/lib/utils";

interface HierarchicalFilterBarProps {
  selectedSeasons: Season[];
  selectedCategories: SubCategory[];
  onSeasonToggle: (season: Season) => void;
  onCategoryToggle: (category: SubCategory) => void;
  onMainCategoryToggle: (mainCategory: MainCategory) => void;
  isMainCategoryFullySelected: (mainCategory: MainCategory) => boolean;
  isMainCategoryPartiallySelected: (mainCategory: MainCategory) => boolean;
  onReset: () => void;
}

export const HierarchicalFilterBar = ({
  selectedSeasons,
  selectedCategories,
  onSeasonToggle,
  onCategoryToggle,
  onMainCategoryToggle,
  isMainCategoryFullySelected,
  isMainCategoryPartiallySelected,
  onReset,
}: HierarchicalFilterBarProps) => {
  const hasFilters = selectedSeasons.length > 0 || selectedCategories.length > 0;

  return (
    <div className="space-y-3">
      {/* 계절 섹션 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-secondary-1">계절</span>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={onReset}
            aria-label="필터 초기화"
            disabled={!hasFilters}
          >
            <RotateCcw size={16} className={hasFilters ? "text-primary" : "text-secondary-1/50"} />
          </IconButton>
        </div>
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex items-center gap-2 min-w-max md:flex-wrap md:min-w-0">
            {SEASONS.map(({ value, label }) => (
              <Button
                key={value}
                variant="chip"
                size="sm"
                selected={selectedSeasons.includes(value)}
                onClick={() => onSeasonToggle(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 카테고리 섹션 */}
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-secondary-1">카테고리</span>
        {MAIN_CATEGORIES.map(({ value: mainValue, label: mainLabel }) => {
          const isFullySelected = isMainCategoryFullySelected(mainValue);
          const isPartiallySelected = isMainCategoryPartiallySelected(mainValue);
          const subCategories = CATEGORY_HIERARCHY[mainValue];

          return (
            <div
              key={mainValue}
              className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
            >
              <div className="flex items-center gap-2 min-w-max md:flex-wrap md:min-w-0">
                {/* 최상위 카테고리 버튼 - 전체선택 버튼 */}
                <button
                  type="button"
                  onClick={() => onMainCategoryToggle(mainValue)}
                  className={cn(
                    "shrink-0 px-2.5 py-1 text-xs font-medium rounded-full cursor-pointer transition-all border",
                    isFullySelected
                      ? "bg-primary text-white border-primary"
                      : isPartiallySelected
                        ? "bg-primary/10 text-primary border-primary/50"
                        : "bg-transparent text-secondary-1 border-secondary-1/50 hover:border-primary hover:text-primary"
                  )}
                >
                  {mainLabel}
                </button>

                <div className="h-4 w-px bg-secondary-1/30 shrink-0" />

                {/* 하위 카테고리 버튼들 */}
                {subCategories.map(({ value: subValue, label: subLabel }) => (
                  <Button
                    key={subValue}
                    variant="chip"
                    size="sm"
                    selected={selectedCategories.includes(subValue)}
                    onClick={() => onCategoryToggle(subValue)}
                  >
                    {subLabel}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
