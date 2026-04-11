"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Sparkles } from "lucide-react";
import { Fab, Button, IconButton } from "@/components/ui";
import { OutfitCard } from "@/components/outfit";
import { useOutfits } from "@/hooks/useOutfits";
import { SEASONS, STYLES, MOODS } from "@/lib/constants";
import type { Season, Style, Mood, Outfit } from "@/types";

export default function OutfitsPage() {
  const router = useRouter();
  const { outfits, isLoading, error } = useOutfits();

  // 필터 상태
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<Style[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<Mood[]>([]);

  const toggleSeason = (season: Season) => {
    setSelectedSeasons((prev) =>
      prev.includes(season)
        ? prev.filter((s) => s !== season)
        : [...prev, season]
    );
  };

  const toggleStyle = (style: Style) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };

  const toggleMood = (mood: Mood) => {
    setSelectedMoods((prev) =>
      prev.includes(mood)
        ? prev.filter((m) => m !== mood)
        : [...prev, mood]
    );
  };

  const resetFilters = () => {
    setSelectedSeasons([]);
    setSelectedStyles([]);
    setSelectedMoods([]);
  };

  // 필터링된 코디 목록
  const filteredOutfits = useMemo(() => {
    return outfits.filter((outfit: Outfit) => {
      // 계절 필터
      if (selectedSeasons.length > 0) {
        const hasMatchingSeason = outfit.seasons.some((s) =>
          selectedSeasons.includes(s)
        );
        if (!hasMatchingSeason) return false;
      }

      // 스타일 필터
      if (selectedStyles.length > 0) {
        const hasMatchingStyle = outfit.styles.some((s) =>
          selectedStyles.includes(s)
        );
        if (!hasMatchingStyle) return false;
      }

      // 무드 필터
      if (selectedMoods.length > 0) {
        const hasMatchingMood = outfit.moods.some((m) =>
          selectedMoods.includes(m)
        );
        if (!hasMatchingMood) return false;
      }

      return true;
    });
  }, [outfits, selectedSeasons, selectedStyles, selectedMoods]);

  const hasFilters = selectedSeasons.length > 0 || selectedStyles.length > 0 || selectedMoods.length > 0;

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <Fab icon={Sparkles} label="코디 만들기" onClick={() => router.push("/outfit/new")} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="text-center text-red-500 py-12">
          <p>{error}</p>
        </div>
        <Fab icon={Sparkles} label="코디 만들기" onClick={() => router.push("/outfit/new")} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* 필터 영역 */}
        <div className="space-y-3">
          {/* 계절 섹션 */}
          <div className="flex items-center gap-2">
            <span className="w-10 text-xs font-medium text-secondary-1 shrink-0">계절</span>
            <div className="overflow-x-auto scrollbar-hide flex-1">
              <div className="flex items-center gap-2 min-w-max">
                {SEASONS.map(({ value, label }) => (
                  <Button
                    key={value}
                    variant="chip"
                    size="sm"
                    selected={selectedSeasons.includes(value)}
                    onClick={() => toggleSeason(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              aria-label="필터 초기화"
              disabled={!hasFilters}
              className="shrink-0"
            >
              <RotateCcw size={16} className={hasFilters ? "text-primary" : "text-secondary-1/50"} />
            </IconButton>
          </div>

          {/* 구분선 */}
          <div className="h-px bg-secondary-1/20" />

          {/* 스타일 섹션 */}
          <div className="flex items-center gap-2">
            <span className="w-10 text-xs font-medium text-secondary-1 shrink-0">스타일</span>
            <div className="overflow-x-auto scrollbar-hide flex-1">
              <div className="flex items-center gap-2 min-w-max">
                {STYLES.map(({ value, label }) => (
                  <Button
                    key={value}
                    variant="chip"
                    size="sm"
                    selected={selectedStyles.includes(value)}
                    onClick={() => toggleStyle(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* 무드 섹션 */}
          <div className="flex items-center gap-2">
            <span className="w-10 text-xs font-medium text-secondary-1 shrink-0">무드</span>
            <div className="overflow-x-auto scrollbar-hide flex-1">
              <div className="flex items-center gap-2 min-w-max">
                {MOODS.map(({ value, label }) => (
                  <Button
                    key={value}
                    variant="chip"
                    size="sm"
                    selected={selectedMoods.includes(value)}
                    onClick={() => toggleMood(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 코디 목록 */}
        {filteredOutfits.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filteredOutfits.map((outfit: Outfit) => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                onClick={() => router.push(`/outfit/${outfit.id}`)}
              />
            ))}
          </div>
        ) : outfits.length > 0 ? (
          <div className="text-center text-secondary-1 py-12">
            <p>조건에 맞는 코디가 없습니다</p>
            <p className="mt-2 text-sm">필터를 변경해보세요</p>
          </div>
        ) : (
          <div className="text-center text-secondary-1 py-12">
            <p>저장된 코디가 없습니다</p>
            <p className="mt-2 text-sm">코디를 만들어보세요</p>
          </div>
        )}
      </div>

      <Fab icon={Sparkles} label="코디 만들기" onClick={() => router.push("/outfit/new")} />
    </>
  );
}
