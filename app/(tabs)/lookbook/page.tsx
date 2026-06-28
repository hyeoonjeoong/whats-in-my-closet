"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Camera } from "lucide-react";
import { Fab, Button, IconButton } from "@/components/ui";
import { SEASONS, STYLES, MOODS } from "@/lib/constants";
import type { Season, Style, Mood } from "@/types";

export default function LookbookPage() {
  const router = useRouter();

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

  const toggleAllSeasons = () => {
    const allSeasonValues = SEASONS.map((s) => s.value);
    const isAllSelected = allSeasonValues.every((v) => selectedSeasons.includes(v));
    setSelectedSeasons(isAllSelected ? [] : allSeasonValues);
  };

  const isAllSeasonsSelected = SEASONS.every((s) => selectedSeasons.includes(s.value));

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

  const hasFilters = selectedSeasons.length > 0 || selectedStyles.length > 0 || selectedMoods.length > 0;

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
                {/* 계절무관 바로가기 */}
                <Button
                  variant="chip"
                  size="sm"
                  selected={isAllSeasonsSelected}
                  onClick={toggleAllSeasons}
                >
                  계절무관
                </Button>
                <div className="h-4 w-px bg-secondary-1/30" />
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

        {/* 룩북 목록 (빈 상태) */}
        <div className="text-center text-secondary-1 py-12">
          <p>등록된 룩북이 없습니다</p>
          <p className="mt-2 text-sm">착용 사진을 올려보세요</p>
        </div>
      </div>

      <Fab icon={Camera} label="룩북 추가" onClick={() => router.push("/lookbook/new")} />
    </>
  );
}
