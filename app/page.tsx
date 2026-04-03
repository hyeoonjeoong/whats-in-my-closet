"use client";

import { useState } from "react";
import { Header, BottomNav } from "@/components/layout";
import {
  FilterBar,
  ClothesList,
  AddClothesModal,
  ClothesDetailModal,
} from "@/components/closet";
import { useFilter } from "@/hooks/useFilter";
import { useClothes } from "@/hooks/useClothes";
import type { ClothingItem } from "@/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"closet" | "outfits">("closet");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const { clothes, isLoading, error, refetch } = useClothes();

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

  return (
    <div className="flex min-h-full flex-col pb-16">
      <Header onAddClick={() => setIsAddModalOpen(true)} />

      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-3xl">
          {activeTab === "closet" ? (
            <ClosetView
              clothes={clothes}
              isLoading={isLoading}
              error={error}
              onItemClick={handleItemClick}
            />
          ) : (
            <OutfitsView />
          )}
        </div>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

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
    </div>
  );
}

interface ClosetViewProps {
  clothes: ClothingItem[];
  isLoading: boolean;
  error: string | null;
  onItemClick: (itemId: string) => void;
}

const ClosetView = ({ clothes, isLoading, error, onItemClick }: ClosetViewProps) => {
  const { filters, toggleSeason, toggleCategory, resetFilters } = useFilter();

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
    <div className="space-y-6">
      <FilterBar
        selectedSeasons={filters.seasons}
        selectedCategories={filters.categories}
        onSeasonToggle={toggleSeason}
        onCategoryToggle={toggleCategory}
        onReset={resetFilters}
      />

      {clothes.length > 0 ? (
        <ClothesList items={clothes} filters={filters} onItemClick={onItemClick} />
      ) : (
        <div className="text-center text-secondary-1 py-12">
          <p>옷장이 비어있습니다</p>
          <p className="mt-2 text-sm">우측 상단 + 버튼을 눌러 옷을 추가해보세요</p>
        </div>
      )}
    </div>
  );
};

const OutfitsView = () => {
  return (
    <div className="text-center text-secondary-1 py-12">
      <p>저장된 코디가 없습니다</p>
      <p className="mt-2 text-sm">코디를 만들어보세요</p>
    </div>
  );
};
