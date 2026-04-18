"use client";

import { Button } from "./Button";
import {
  BASIC_SEASONS,
  SHORTCUT_SEASONS,
  ALL_BASIC_SEASONS,
  BETWEEN_SEASONS,
} from "@/lib/constants";
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
  const isAllSelected = ALL_BASIC_SEASONS.every((s) => value.includes(s));

  // 간절기 상태: 가을, 겨울 모두 선택됨
  const isBetweenSelected =
    BETWEEN_SEASONS.every((s) => value.includes(s)) && value.includes("between");

  const handleShortcutToggle = (shortcut: "all" | "between") => {
    if (shortcut === "all") {
      if (isAllSelected) {
        // 계절무관 해제 → 모든 기본 계절 제거
        onChange?.(value.filter((s) => !ALL_BASIC_SEASONS.includes(s)));
      } else {
        // 계절무관 선택 → 모든 기본 계절 추가
        const newValue = [...new Set([...value, ...ALL_BASIC_SEASONS])] as Season[];
        onChange?.(newValue);
      }
    } else if (shortcut === "between") {
      if (isBetweenSelected) {
        // 간절기 해제 → 가을, 겨울, 간절기 제거
        onChange?.(
          value.filter((s) => !BETWEEN_SEASONS.includes(s) && s !== "between")
        );
      } else {
        // 간절기 선택 → 가을, 겨울, 간절기 추가
        const newValue = [...new Set([...value, ...BETWEEN_SEASONS, "between" as Season])] as Season[];
        onChange?.(newValue);
      }
    }
  };

  const handleSeasonToggle = (season: Season) => {
    let newValue: Season[];

    if (value.includes(season)) {
      newValue = value.filter((s) => s !== season);

      // 가을 또는 겨울 해제 시 간절기도 해제
      if (BETWEEN_SEASONS.includes(season)) {
        newValue = newValue.filter((s) => s !== "between");
      }
    } else {
      newValue = [...value, season];

      // 가을 + 겨울 모두 선택 시 간절기 자동 선택
      if (
        BETWEEN_SEASONS.every((s) => newValue.includes(s)) &&
        !newValue.includes("between")
      ) {
        newValue.push("between");
      }
    }

    onChange?.(newValue);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-primary">
          {label}
        </label>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {/* 바로가기 버튼 */}
        {SHORTCUT_SEASONS.map(({ value: shortcutValue, label: shortcutLabel }) => (
          <Button
            key={shortcutValue}
            type="button"
            variant="chip"
            size="sm"
            dashed
            selected={shortcutValue === "all" ? isAllSelected : isBetweenSelected}
            onClick={() => handleShortcutToggle(shortcutValue)}
          >
            {shortcutLabel}
          </Button>
        ))}

        {/* 구분선 */}
        <div className="h-4 w-px bg-secondary-1/30 mx-1" />

        {/* 기본 계절 버튼 */}
        {BASIC_SEASONS.map(({ value: seasonValue, label: seasonLabel }) => (
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
