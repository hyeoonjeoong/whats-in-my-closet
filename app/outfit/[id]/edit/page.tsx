"use client";

import { useState, useEffect, use } from "react";
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
import { useOutfitDetail } from "@/hooks/useOutfits";
import { updateOutfitAction } from "@/lib/actions/outfits";
import type { Season } from "@/types";

interface EditOutfitPageProps {
  params: Promise<{ id: string }>;
}

export default function EditOutfitPage({ params }: EditOutfitPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { clothes, isLoading: isClothesLoading, error: clothesError } = useClothes();
  const { outfit, isLoading: isOutfitLoading, error: outfitError } = useOutfitDetail(id);
  const { filters, toggleSeason, toggleCategory, resetFilters } = useFilter();
  const {
    selection,
    toggleItem,
    removeItem,
    isSelected,
    selectedIds,
    hasSelection,
    loadFromOutfit,
  } = useOutfitBuilder();
  const { showToast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilterChange = (action: () => void) => {
    action();
    setCurrentPage(1);
  };

  useEffect(() => {
    if (outfit && !isInitialized) {
      loadFromOutfit(outfit.items);
      setIsInitialized(true);
    }
  }, [outfit, isInitialized, loadFromOutfit]);

  const handleSave = async (data: { name: string; seasons: Season[]; password: string }) => {
    if (!hasSelection) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("password", data.password);
      formData.append(
        "data",
        JSON.stringify({
          name: data.name,
          seasons: data.seasons,
          clothingIds: selectedIds,
        })
      );

      const result = await updateOutfitAction(formData);

      if (result.success) {
        showToast("코디가 수정되었습니다", "success");
        router.push(`/outfit/${id}`);
      } else {
        showToast(result.error || "코디 수정에 실패했습니다", "error");
      }
    } catch {
      showToast("코디 수정 중 오류가 발생했습니다", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isClothesLoading || isOutfitLoading;
  const error = clothesError || outfitError;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <OutfitHeader title="코디 수정" />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !outfit) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <OutfitHeader title="코디 수정" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-red-500">{error || "코디를 찾을 수 없습니다"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <OutfitHeader title="코디 수정" />

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
          defaultName={outfit.name}
          defaultSeasons={outfit.seasons}
          onSave={handleSave}
          isLoading={isSaving}
          hasSelection={hasSelection}
          submitLabel="수정하기"
        />
      </main>
    </div>
  );
}
