"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shirt, Save } from "lucide-react";
import {
  OutfitHeader,
  OutfitCollage,
  SelectableClothesGrid,
  OutfitSaveSection,
} from "@/components/outfit";
import { HierarchicalFilterBar } from "@/components/closet";
import { useToast } from "@/components/ui";
import { useClothes } from "@/hooks/useClothes";
import { useFilter } from "@/hooks/useFilter";
import { useOutfitBuilder } from "@/hooks/useOutfitBuilder";
import { useOutfits } from "@/hooks/useOutfits";
import { createOutfitAction } from "@/lib/actions/outfits";
import type { Season, Style, Mood } from "@/types";

export default function NewOutfitPage() {
  const router = useRouter();
  const { clothes, isLoading: isClothesLoading, error: clothesError } = useClothes();
  const { getNextOutfitName } = useOutfits();
  const {
    filters,
    toggleSeason,
    toggleCategory,
    toggleMainCategory,
    isMainCategoryFullySelected,
    isMainCategoryPartiallySelected,
    resetFilters,
  } = useFilter();
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

  const handleSave = async (data: { name: string; seasons: Season[]; styles: Style[]; moods: Mood[]; password: string }) => {
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
          styles: data.styles,
          moods: data.moods,
          clothingIds: selectedIds,
        })
      );

      const result = await createOutfitAction(formData);

      if (result.success) {
        showToast("코디가 저장되었습니다", "success");
        router.replace("/outfits");
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

      <main className="flex-1 p-4 space-y-6">
        {/* 상단 섹션: 옷 선택 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Shirt size={18} />
            <h2 className="font-semibold">내 옷장에서 선택</h2>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
            {/* 필터 */}
            <HierarchicalFilterBar
              selectedSeasons={filters.seasons}
              selectedCategories={filters.categories}
              onSeasonToggle={(s) => handleFilterChange(() => toggleSeason(s))}
              onCategoryToggle={(c) => handleFilterChange(() => toggleCategory(c))}
              onMainCategoryToggle={(m) => handleFilterChange(() => toggleMainCategory(m))}
              isMainCategoryFullySelected={isMainCategoryFullySelected}
              isMainCategoryPartiallySelected={isMainCategoryPartiallySelected}
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
          </div>

          {/* 콜라주 프리뷰 */}
          <OutfitCollage
            selection={selection}
            onRemove={removeItem}
            editable
          />
        </section>

        {/* 구분선 */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-secondary-1/30" />
          <span className="text-xs text-secondary-1">코디 정보 입력</span>
          <div className="h-px flex-1 bg-secondary-1/30" />
        </div>

        {/* 하단 섹션: 코디 정보 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Save size={18} />
            <h2 className="font-semibold">코디 등록</h2>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <OutfitSaveSection
              placeholderName={getNextOutfitName()}
              onSave={handleSave}
              isLoading={isSaving}
              hasSelection={hasSelection}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
