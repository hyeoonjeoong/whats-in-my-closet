"use client";

import { ClothesCard } from "./ClothesCard";
import type { ClothingItem, FilterState } from "@/types";

interface ClothesListProps {
  items: ClothingItem[];
  filters: FilterState;
  onItemClick?: (itemId: string) => void;
}

export const ClothesList = ({ items, filters, onItemClick }: ClothesListProps) => {
  // 필터 적용
  const filteredItems = items.filter((item) => {
    // 계절 필터
    if (filters.seasons.length > 0) {
      const hasMatchingSeason = item.seasons.some((s) =>
        filters.seasons.includes(s)
      );
      if (!hasMatchingSeason) return false;
    }

    // 카테고리 필터
    if (filters.categories.length > 0) {
      if (!filters.categories.includes(item.category)) return false;
    }

    return true;
  });

  if (filteredItems.length === 0) {
    return (
      <div className="text-center text-secondary-1 py-12">
        <p>조건에 맞는 옷이 없습니다</p>
        <p className="mt-2 text-sm">필터를 변경해보세요</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {filteredItems.map((item) => (
        <ClothesCard
          key={item.id}
          item={item}
          onClick={() => onItemClick?.(item.id)}
        />
      ))}
    </div>
  );
}
