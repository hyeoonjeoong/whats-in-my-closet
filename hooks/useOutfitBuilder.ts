"use client";

import { useState, useCallback, useMemo } from "react";
import type { ClothingItem, MainCategory } from "@/types";
import { SUB_TO_MAIN_CATEGORY } from "@/lib/constants";

export interface OutfitSelection {
  top: ClothingItem | null;
  outer: ClothingItem | null;
  bottom: ClothingItem | null;
  shoes: ClothingItem | null;
  bag: ClothingItem | null;
  accessories: ClothingItem[];
}

const initialSelection: OutfitSelection = {
  top: null,
  outer: null,
  bottom: null,
  shoes: null,
  bag: null,
  accessories: [],
};

// 아이템의 주 카테고리 (상위 카테고리) 결정
const getMainCategory = (item: ClothingItem): MainCategory => {
  if (item.categories.length === 0) {
    return "accessory"; // fallback
  }
  // 첫 번째 하위 카테고리의 상위 카테고리 사용
  return SUB_TO_MAIN_CATEGORY[item.categories[0]];
};

export const useOutfitBuilder = () => {
  const [selection, setSelection] = useState<OutfitSelection>(initialSelection);

  const toggleItem = useCallback((item: ClothingItem) => {
    setSelection((prev) => {
      const mainCategory = getMainCategory(item);

      if (mainCategory === "accessory") {
        const isSelected = prev.accessories.some((a) => a.id === item.id);
        return {
          ...prev,
          accessories: isSelected
            ? prev.accessories.filter((a) => a.id !== item.id)
            : [...prev.accessories, item],
        };
      }

      const slotKey = mainCategory as keyof Omit<OutfitSelection, "accessories">;
      const current = prev[slotKey];

      if (current?.id === item.id) {
        return { ...prev, [slotKey]: null };
      }

      return { ...prev, [slotKey]: item };
    });
  }, []);

  const removeItem = useCallback((category: MainCategory, itemId?: string) => {
    setSelection((prev) => {
      if (category === "accessory") {
        if (itemId) {
          return {
            ...prev,
            accessories: prev.accessories.filter((a) => a.id !== itemId),
          };
        }
        return { ...prev, accessories: [] };
      }

      const slotKey = category as keyof Omit<OutfitSelection, "accessories">;
      return { ...prev, [slotKey]: null };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(initialSelection);
  }, []);

  const isSelected = useCallback(
    (item: ClothingItem): boolean => {
      const mainCategory = getMainCategory(item);

      if (mainCategory === "accessory") {
        return selection.accessories.some((a) => a.id === item.id);
      }

      const slotKey = mainCategory as keyof Omit<OutfitSelection, "accessories">;
      return selection[slotKey]?.id === item.id;
    },
    [selection]
  );

  const selectedItems = useMemo((): ClothingItem[] => {
    const items: ClothingItem[] = [];

    if (selection.top) items.push(selection.top);
    if (selection.outer) items.push(selection.outer);
    if (selection.bottom) items.push(selection.bottom);
    if (selection.shoes) items.push(selection.shoes);
    if (selection.bag) items.push(selection.bag);
    items.push(...selection.accessories);

    return items;
  }, [selection]);

  const selectedIds = useMemo(
    (): string[] => selectedItems.map((item) => item.id),
    [selectedItems]
  );

  const hasSelection = useMemo(
    (): boolean => selectedItems.length > 0,
    [selectedItems]
  );

  const loadFromOutfit = useCallback((items: ClothingItem[]) => {
    const newSelection: OutfitSelection = { ...initialSelection, accessories: [] };

    for (const item of items) {
      const mainCategory = getMainCategory(item);

      if (mainCategory === "accessory") {
        newSelection.accessories.push(item);
      } else {
        const slotKey = mainCategory as keyof Omit<OutfitSelection, "accessories">;
        newSelection[slotKey] = item;
      }
    }

    setSelection(newSelection);
  }, []);

  return {
    selection,
    toggleItem,
    removeItem,
    clearSelection,
    isSelected,
    selectedItems,
    selectedIds,
    hasSelection,
    loadFromOutfit,
  };
};
