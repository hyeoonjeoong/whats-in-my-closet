"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SelectableClothesCard } from "./SelectableClothesCard";
import { IconButton } from "@/components/ui";
import type { ClothingItem, FilterState } from "@/types";

interface SelectableClothesGridProps {
  items: ClothingItem[];
  filters: FilterState;
  isSelected: (item: ClothingItem) => boolean;
  onToggle: (item: ClothingItem) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const ITEMS_PER_PAGE = 10;

export const SelectableClothesGrid = ({
  items,
  filters,
  isSelected,
  onToggle,
  currentPage,
  onPageChange,
}: SelectableClothesGridProps) => {
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSeason =
        filters.seasons.length === 0 ||
        item.seasons.some((s) => filters.seasons.includes(s));
      const matchesCategory =
        filters.categories.length === 0 ||
        filters.categories.includes(item.category);
      return matchesSeason && matchesCategory;
    });
  }, [items, filters]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

  const paginatedItems = useMemo(() => {
    const start = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, validPage]);

  if (filteredItems.length === 0) {
    return (
      <div className="py-8 text-center text-secondary-1">
        <p>조건에 맞는 옷이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 그리드 */}
      <div className="grid grid-cols-5 gap-2">
        {paginatedItems.map((item) => (
          <SelectableClothesCard
            key={item.id}
            item={item}
            isSelected={isSelected(item)}
            onClick={() => onToggle(item)}
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <IconButton
            onClick={() => onPageChange(Math.max(1, validPage - 1))}
            disabled={validPage === 1}
            variant="ghost"
            size="sm"
            aria-label="이전 페이지"
          >
            <ChevronLeft size={20} />
          </IconButton>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
                  page === validPage
                    ? "bg-primary text-white"
                    : "text-secondary-1 hover:bg-secondary-3"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <IconButton
            onClick={() => onPageChange(Math.min(totalPages, validPage + 1))}
            disabled={validPage === totalPages}
            variant="ghost"
            size="sm"
            aria-label="다음 페이지"
          >
            <ChevronRight size={20} />
          </IconButton>
        </div>
      )}
    </div>
  );
};
