"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  OutfitHeader,
  OutfitCollage,
  SelectableClothesGrid,
  OutfitSaveSection,
} from "@/components/outfit";
import { FilterBar } from "@/components/closet";
import { useToast } from "@/components/ui";
import { useClothes } from "@/hooks/useClothes";
import { useFilter } from "@/hooks/useFilter";
import { useOutfitBuilder } from "@/hooks/useOutfitBuilder";
import { useOutfits } from "@/hooks/useOutfits";
import { createOutfitAction } from "@/lib/actions/outfits";
import type { Season } from "@/types";

export default function NewOutfitPage() {
  const router = useRouter();
  const { clothes, isLoading: isClothesLoading, error: clothesError } = useClothes();
  const { getNextOutfitName } = useOutfits();
  const { filters, toggleSeason, toggleCategory, resetFilters } = useFilter();
  const {
    selection,
    toggleItem,
    removeItem,
    isSelected,
    selectedIds,
    hasSelection,
  } = useOutfitBuilder();
  const { showToast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilterChange = (action: () => void) => {
    action();
    setCurrentPage(1);
  };

  const handleSave = async (data: { name: string; seasons: Season[]; password: string }) => {
    if (!hasSelection) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("password", data.password);
      formData.append(
        "data",
        JSON.stringify({
          name: data.name,
          seasons: data.seasons,
          clothingIds: selectedIds,
        })
      );

      const result = await createOutfitAction(formData);

      if (result.success) {
        showToast("코디가 저장되었습니다", "success");
        router.push("/outfits");
      } else {
        showToast(result.error || "코디 저장에 실패했습니다", "error");
      }
    } catch {
      showToast("코디 저장 중 오류가 발생했습니다", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isClothesLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <OutfitHeader title="코디 만들기" />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (clothesError) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <OutfitHeader title="코디 만들기" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-red-500">{clothesError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <OutfitHeader title="코디 만들기" />

      <main className="flex-1 space-y-6 p-4">
        {/* 필터 */}
        <FilterBar
          selectedSeasons={filters.seasons}
          selectedCategories={filters.categories}
          onSeasonToggle={(s) => handleFilterChange(() => toggleSeason(s))}
          onCategoryToggle={(c) => handleFilterChange(() => toggleCategory(c))}
          onReset={() => handleFilterChange(resetFilters)}
        />

        {/* 옷 선택 그리드 */}
        {clothes.length > 0 ? (
          <SelectableClothesGrid
            items={clothes}
            filters={filters}
            isSelected={isSelected}
            onToggle={toggleItem}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        ) : (
          <div className="py-8 text-center text-secondary-1">
            <p>옷장이 비어있습니다</p>
            <p className="mt-2 text-sm">먼저 옷을 추가해주세요</p>
          </div>
        )}

        {/* 콜라주 프리뷰 */}
        <OutfitCollage
          selection={selection}
          onRemove={removeItem}
          editable
        />

        {/* 저장 섹션 */}
        <OutfitSaveSection
          placeholderName={getNextOutfitName()}
          onSave={handleSave}
          isLoading={isSaving}
          hasSelection={hasSelection}
        />
      </main>
    </div>
  );
}
