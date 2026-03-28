"use client";

import { useState } from "react";
import { Header, BottomNav } from "@/components/layout";
import { FilterBar, ClothesList } from "@/components/closet";
import { useFilter } from "@/hooks/useFilter";
import type { ClothingItem } from "@/types";

// 더미 데이터 (임시)
const DUMMY_CLOTHES: ClothingItem[] = [
  {
    id: "1",
    name: "화이트 오버핏 티셔츠",
    imageUrl: "",
    category: "top",
    seasons: ["spring", "summer"],
    purchaseLink: "https://example.com/product/1",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    name: "블랙 슬랙스",
    imageUrl: "",
    category: "bottom",
    seasons: ["spring", "fall", "winter"],
    createdAt: "2024-01-02",
    updatedAt: "2024-01-02",
  },
  {
    id: "3",
    name: "베이지 트렌치코트",
    imageUrl: "",
    category: "outer",
    seasons: ["spring", "fall"],
    purchaseLink: "https://example.com/product/3",
    createdAt: "2024-01-03",
    updatedAt: "2024-01-03",
  },
  {
    id: "4",
    name: "네이비 니트",
    imageUrl: "",
    category: "top",
    seasons: ["fall", "winter"],
    createdAt: "2024-01-04",
    updatedAt: "2024-01-04",
  },
  {
    id: "5",
    name: "데님 팬츠",
    imageUrl: "",
    category: "bottom",
    seasons: ["spring", "summer", "fall"],
    createdAt: "2024-01-05",
    updatedAt: "2024-01-05",
  },
  {
    id: "6",
    name: "화이트 스니커즈",
    imageUrl: "",
    category: "shoes",
    seasons: ["spring", "summer", "fall"],
    purchaseLink: "https://example.com/product/6",
    createdAt: "2024-01-06",
    updatedAt: "2024-01-06",
  },
  {
    id: "7",
    name: "블랙 패딩",
    imageUrl: "",
    category: "outer",
    seasons: ["winter"],
    createdAt: "2024-01-07",
    updatedAt: "2024-01-07",
  },
  {
    id: "8",
    name: "토트백",
    imageUrl: "",
    category: "bag",
    seasons: ["spring", "summer", "fall", "winter"],
    createdAt: "2024-01-08",
    updatedAt: "2024-01-08",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"closet" | "outfits">("closet");

  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-3xl">
          {activeTab === "closet" ? <ClosetView /> : <OutfitsView />}
        </div>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function ClosetView() {
  const { filters, toggleSeason, toggleCategory } = useFilter();
  // 실제 데이터 연동 시 여기서 데이터를 가져옴
  const clothes = DUMMY_CLOTHES;

  return (
    <div className="space-y-6">
      <FilterBar
        selectedSeasons={filters.seasons}
        selectedCategories={filters.categories}
        onSeasonToggle={toggleSeason}
        onCategoryToggle={toggleCategory}
      />

      {clothes.length > 0 ? (
        <ClothesList items={clothes} filters={filters} />
      ) : (
        <div className="text-center text-secondary-1 py-12">
          <p>옷장이 비어있습니다</p>
          <p className="mt-2 text-sm">옷을 추가해보세요</p>
        </div>
      )}
    </div>
  );
}

function OutfitsView() {
  return (
    <div className="text-center text-secondary-1 py-12">
      <p>저장된 코디가 없습니다</p>
      <p className="mt-2 text-sm">코디를 만들어보세요</p>
    </div>
  );
}
