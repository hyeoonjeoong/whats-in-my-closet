"use client";

import { useState, useCallback } from "react";
import type { Season, MainCategory, SubCategory, FilterState } from "@/types";
import {
  getSubCategoriesOf,
  ALL_SEASONS,
  ALL_BASIC_SEASONS,
  BETWEEN_SEASONS,
} from "@/lib/constants";

export function useFilter() {
  const [filters, setFilters] = useState<FilterState>({
    seasons: [],
    categories: [],
  });

  // 계절 필터 토글
  const toggleSeason = useCallback((season: Season) => {
    setFilters((prev) => {
      let newSeasons: Season[];

      if (prev.seasons.includes(season)) {
        newSeasons = prev.seasons.filter((s) => s !== season);

        // 가을 또는 겨울 해제 시 간절기도 해제
        if (BETWEEN_SEASONS.includes(season)) {
          newSeasons = newSeasons.filter((s) => s !== "between");
        }
      } else {
        newSeasons = [...prev.seasons, season];

        // 가을 + 겨울 모두 선택 시 간절기 자동 선택
        if (
          BETWEEN_SEASONS.every((s) => newSeasons.includes(s)) &&
          !newSeasons.includes("between")
        ) {
          newSeasons.push("between");
        }
      }

      return { ...prev, seasons: newSeasons };
    });
  }, []);

  // 계절무관 토글 (봄, 여름, 가을, 겨울 전체)
  const toggleAllSeasons = useCallback(() => {
    setFilters((prev) => {
      const allBasicSelected = ALL_BASIC_SEASONS.every((s) =>
        prev.seasons.includes(s)
      );

      if (allBasicSelected) {
        // 계절무관 해제 → 모든 기본 계절 제거
        return {
          ...prev,
          seasons: prev.seasons.filter((s) => !ALL_BASIC_SEASONS.includes(s)),
        };
      } else {
        // 계절무관 선택 → 모든 기본 계절 추가 + 가을/겨울 포함이므로 간절기도 추가
        const newSeasons = [...new Set([...prev.seasons, ...ALL_BASIC_SEASONS, "between" as Season])] as Season[];
        return { ...prev, seasons: newSeasons };
      }
    });
  }, []);

  // 간절기 토글 (가을, 겨울, 간절기)
  const toggleBetweenSeasons = useCallback(() => {
    setFilters((prev) => {
      const isBetweenSelected =
        BETWEEN_SEASONS.every((s) => prev.seasons.includes(s)) &&
        prev.seasons.includes("between");

      if (isBetweenSelected) {
        // 간절기 해제 → 가을, 겨울, 간절기 제거
        return {
          ...prev,
          seasons: prev.seasons.filter(
            (s) => !BETWEEN_SEASONS.includes(s) && s !== "between"
          ),
        };
      } else {
        // 간절기 선택 → 가을, 겨울, 간절기 추가
        const newSeasons = [
          ...new Set([...prev.seasons, ...BETWEEN_SEASONS, "between" as Season]),
        ] as Season[];
        return { ...prev, seasons: newSeasons };
      }
    });
  }, []);

  // 계절무관 상태 (봄, 여름, 가을, 겨울 모두 선택됨)
  const isAllSeasonsSelected = useCallback((): boolean => {
    return ALL_BASIC_SEASONS.every((s) => filters.seasons.includes(s));
  }, [filters.seasons]);

  // 간절기 상태 (가을, 겨울, 간절기 모두 선택됨)
  const isBetweenSeasonsSelected = useCallback((): boolean => {
    return (
      BETWEEN_SEASONS.every((s) => filters.seasons.includes(s)) &&
      filters.seasons.includes("between")
    );
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
    toggleBetweenSeasons,
    isAllSeasonsSelected,
    isBetweenSeasonsSelected,
    isSeasonsPartiallySelected,
    toggleCategory,
    toggleMainCategory,
    isMainCategoryFullySelected,
    isMainCategoryPartiallySelected,
    resetFilters,
  };
}
