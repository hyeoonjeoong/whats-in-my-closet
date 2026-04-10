"use client";

import { Button } from "./Button";
import { SEASONS } from "@/lib/constants";
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

      <div className="flex flex-wrap gap-1.5">
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
