"use client";

import { useState, useCallback, useMemo } from "react";
import type { ClothingItem, Category } from "@/types";

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

export const useOutfitBuilder = () => {
  const [selection, setSelection] = useState<OutfitSelection>(initialSelection);

  const toggleItem = useCallback((item: ClothingItem) => {
    setSelection((prev) => {
      const category = item.category;

      if (category === "accessory") {
        const isSelected = prev.accessories.some((a) => a.id === item.id);
        return {
          ...prev,
          accessories: isSelected
            ? prev.accessories.filter((a) => a.id !== item.id)
            : [...prev.accessories, item],
        };
      }

      const slotKey = category as keyof Omit<OutfitSelection, "accessories">;
      const current = prev[slotKey];

      if (current?.id === item.id) {
        return { ...prev, [slotKey]: null };
      }

      return { ...prev, [slotKey]: item };
    });
  }, []);

  const removeItem = useCallback((category: Category, itemId?: string) => {
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
      const category = item.category;

      if (category === "accessory") {
        return selection.accessories.some((a) => a.id === item.id);
      }

      const slotKey = category as keyof Omit<OutfitSelection, "accessories">;
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
    const newSelection: OutfitSelection = { ...initialSelection };

    for (const item of items) {
      const category = item.category;

      if (category === "accessory") {
        newSelection.accessories.push(item);
      } else {
        const slotKey = category as keyof Omit<OutfitSelection, "accessories">;
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
