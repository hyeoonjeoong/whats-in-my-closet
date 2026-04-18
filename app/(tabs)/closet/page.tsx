"use client";

import { useState } from "react";
import {
  HierarchicalFilterBar,
  ClothesList,
  AddClothesModal,
  ClothesDetailModal,
} from "@/components/closet";
import { useFilter } from "@/hooks/useFilter";
import { useClothes } from "@/hooks/useClothes";
import type { ClothingItem } from "@/types";
import { Fab } from "@/components/ui";
import { Plus } from "lucide-react";

export default function ClosetPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const { clothes, isLoading, error, refetch } = useClothes();
  const {
    filters,
    toggleSeason,
    toggleAllSeasons,
    toggleBetweenSeasons,
    isAllSeasonsSelected,
    isBetweenSeasonsSelected,
    toggleCategory,
    toggleMainCategory,
    isMainCategoryFullySelected,
    isMainCategoryPartiallySelected,
    resetFilters,
  } = useFilter();

  const handleAddSuccess = (newItem: ClothingItem) => {
    console.log("새 옷 추가됨:", newItem.name);
    refetch();
  };

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleUpdate = (updatedItem: ClothingItem) => {
    console.log("옷 수정됨:", updatedItem.name);
    refetch();
  };

  const handleDelete = (itemId: string) => {
    console.log("옷 삭제됨:", itemId);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-12">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <HierarchicalFilterBar
          selectedSeasons={filters.seasons}
          selectedCategories={filters.categories}
          onSeasonToggle={toggleSeason}
          onAllSeasonsToggle={toggleAllSeasons}
          onBetweenSeasonsToggle={toggleBetweenSeasons}
          isAllSeasonsSelected={isAllSeasonsSelected()}
          isBetweenSeasonsSelected={isBetweenSeasonsSelected()}
          onCategoryToggle={toggleCategory}
          onMainCategoryToggle={toggleMainCategory}
          isMainCategoryFullySelected={isMainCategoryFullySelected}
          isMainCategoryPartiallySelected={isMainCategoryPartiallySelected}
          onReset={resetFilters}
        />

        {clothes.length > 0 ? (
          <ClothesList items={clothes} filters={filters} onItemClick={handleItemClick} />
        ) : (
          <div className="text-center text-secondary-1 py-12">
            <p>옷장이 비어있습니다</p>
            <p className="mt-2 text-sm">우측 하단 버튼을 눌러 옷을 추가해보세요</p>
          </div>
        )}
      </div>

      <Fab icon={Plus} label="옷 추가" onClick={() => setIsAddModalOpen(true)} />

      <AddClothesModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      <ClothesDetailModal
        isOpen={selectedItemId !== null}
        onClose={() => setSelectedItemId(null)}
        itemId={selectedItemId}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </>
  );
}
