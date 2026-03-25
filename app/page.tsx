"use client";

import { useState } from "react";
import { Header, BottomNav } from "@/components/layout";
import { FilterBar } from "@/components/closet";
import { useFilter } from "@/hooks/useFilter";

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

  return (
    <div className="space-y-6">
      <FilterBar
        selectedSeasons={filters.seasons}
        selectedCategories={filters.categories}
        onSeasonToggle={toggleSeason}
        onCategoryToggle={toggleCategory}
      />

      <div className="text-center text-secondary-1 py-12">
        <p>옷장이 비어있습니다</p>
        <p className="mt-2 text-sm">옷을 추가해보세요</p>
      </div>
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
