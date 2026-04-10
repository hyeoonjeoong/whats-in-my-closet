"use client";

import { useState, useCallback } from "react";
import type { Season, MainCategory, SubCategory, FilterState } from "@/types";
import { getSubCategoriesOf, ALL_SEASONS } from "@/lib/constants";

export function useFilter() {
  const [filters, setFilters] = useState<FilterState>({
    seasons: [],
    categories: [],
  });

  // 계절 필터 토글
  const toggleSeason = useCallback((season: Season) => {
    setFilters((prev) => ({
      ...prev,
      seasons: prev.seasons.includes(season)
        ? prev.seasons.filter((s) => s !== season)
        : [...prev.seasons, season],
    }));
  }, []);

  // 전체 계절 토글 (무관 클릭 시)
  const toggleAllSeasons = useCallback(() => {
    setFilters((prev) => {
      const allSelected = ALL_SEASONS.every((s) => prev.seasons.includes(s));
      return {
        ...prev,
        seasons: allSelected ? [] : [...ALL_SEASONS],
      };
    });
  }, []);

  // 전체 계절이 선택되었는지 확인
  const isAllSeasonsSelected = useCallback((): boolean => {
    return ALL_SEASONS.every((s) => filters.seasons.includes(s));
  }, [filters.seasons]);

  // 일부 계절만 선택되었는지 확인
  const isSeasonsPartiallySelected = useCallback((): boolean => {
    const selectedCount = filters.seasons.length;
    return selectedCount > 0 && selectedCount < ALL_SEASONS.length;
  }, [filters.seasons]);

  // 하위 카테고리 토글
  const toggleCategory = useCallback((category: SubCategory) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  }, []);

  // 최상위 카테고리 토글 (하위 전체 선택/해제)
  const toggleMainCategory = useCallback((mainCategory: MainCategory) => {
    setFilters((prev) => {
      const subCategories = getSubCategoriesOf(mainCategory);
      const allSelected = subCategories.every((sub) =>
        prev.categories.includes(sub)
      );

      if (allSelected) {
        // 전체 해제
        return {
          ...prev,
          categories: prev.categories.filter(
            (c) => !subCategories.includes(c)
          ),
        };
      } else {
        // 전체 선택
        const newCategories = new Set([...prev.categories, ...subCategories]);
        return {
          ...prev,
          categories: Array.from(newCategories),
        };
      }
    });
  }, []);

  // 최상위 카테고리가 전체 선택되었는지 확인
  const isMainCategoryFullySelected = useCallback(
    (mainCategory: MainCategory): boolean => {
      const subCategories = getSubCategoriesOf(mainCategory);
      return subCategories.every((sub) => filters.categories.includes(sub));
    },
    [filters.categories]
  );

  // 최상위 카테고리가 일부 선택되었는지 확인
  const isMainCategoryPartiallySelected = useCallback(
    (mainCategory: MainCategory): boolean => {
      const subCategories = getSubCategoriesOf(mainCategory);
      const selectedCount = subCategories.filter((sub) =>
        filters.categories.includes(sub)
      ).length;
      return selectedCount > 0 && selectedCount < subCategories.length;
    },
    [filters.categories]
  );

  // 필터 초기화
  const resetFilters = useCallback(() => {
    setFilters({ seasons: [], categories: [] });
  }, []);

  return {
    filters,
    toggleSeason,
    toggleAllSeasons,
    isAllSeasonsSelected,
    isSeasonsPartiallySelected,
    toggleCategory,
    toggleMainCategory,
    isMainCategoryFullySelected,
    isMainCategoryPartiallySelected,
    resetFilters,
  };
}
