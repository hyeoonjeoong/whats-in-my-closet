"use client";

import { Button } from "./Button";
import { SEASONS, ALL_SEASONS } from "@/lib/constants";
import type { Season } from "@/types";

interface HierarchicalSeasonSelectProps {
  label?: string;
  value: Season[];
  onChange?: (value: Season[]) => void;
  error?: string;
}

export const HierarchicalSeasonSelect = ({
  label,
  value,
  onChange,
  error,
}: HierarchicalSeasonSelectProps) => {
  // 계절무관 상태: 봄, 여름, 가을, 겨울 모두 선택됨
  const isAllSelected = ALL_SEASONS.every((s) => value.includes(s));

  const handleAllToggle = () => {
    if (isAllSelected) {
      // 계절무관 해제 → 모든 계절 제거
      onChange?.([]);
    } else {
      // 계절무관 선택 → 모든 계절 추가
      onChange?.([...ALL_SEASONS]);
    }
  };

  const handleSeasonToggle = (season: Season) => {
    if (value.includes(season)) {
      onChange?.(value.filter((s) => s !== season));
    } else {
      onChange?.([...value, season]);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-primary">
          {label}
        </label>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {/* 계절무관 바로가기 */}
        <Button
          type="button"
          variant="chip"
          size="sm"
          dashed
          selected={isAllSelected}
          onClick={handleAllToggle}
        >
          계절무관
        </Button>

        {/* 구분선 */}
        <div className="h-4 w-px bg-secondary-1/30 mx-1" />

        {/* 개별 계절 버튼 */}
        {SEASONS.map(({ value: seasonValue, label: seasonLabel }) => (
          <Button
            key={seasonValue}
            type="button"
            variant="chip"
            size="sm"
            selected={value.includes(seasonValue)}
            onClick={() => handleSeasonToggle(seasonValue)}
          >
            {seasonLabel}
          </Button>
        ))}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
};
