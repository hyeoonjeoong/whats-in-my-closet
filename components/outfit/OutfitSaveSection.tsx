"use client";

import { useState } from "react";
import { Input, Button, PasswordModal, HierarchicalSeasonSelect } from "@/components/ui";
import { STYLES, MOODS } from "@/lib/constants";
import type { Season, Style, Mood } from "@/types";

interface OutfitSaveSectionProps {
  defaultName?: string;
  placeholderName?: string;
  defaultSeasons?: Season[];
  defaultStyles?: Style[];
  defaultMoods?: Mood[];
  onSave: (data: { name: string; seasons: Season[]; styles: Style[]; moods: Mood[]; password: string }) => void;
  isLoading?: boolean;
  hasSelection: boolean;
  submitLabel?: string;
}

export const OutfitSaveSection = ({
  defaultName = "",
  placeholderName = "",
  defaultSeasons = [],
  defaultStyles = [],
  defaultMoods = [],
  onSave,
  isLoading = false,
  hasSelection,
  submitLabel = "저장하기",
}: OutfitSaveSectionProps) => {
  const [name, setName] = useState(defaultName);
  const [seasons, setSeasons] = useState<Season[]>(defaultSeasons);
  const [styles, setStyles] = useState<Style[]>(defaultStyles);
  const [moods, setMoods] = useState<Mood[]>(defaultMoods);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleStyleToggle = (style: Style) => {
    if (styles.includes(style)) {
      setStyles(styles.filter((s) => s !== style));
    } else {
      setStyles([...styles, style]);
    }
  };

  const handleMoodToggle = (mood: Mood) => {
    if (moods.includes(mood)) {
      setMoods(moods.filter((m) => m !== mood));
    } else {
      setMoods([...moods, mood]);
    }
  };

  const handleSubmit = () => {
    if (!hasSelection) return;
    setIsPasswordModalOpen(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    const finalName = name.trim() || placeholderName || "코디";
    onSave({ name: finalName, seasons, styles, moods, password });
    setIsPasswordModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <Input
        label="코디 이름"
        placeholder={placeholderName || "예: 봄 데일리룩"}
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isLoading}
      />

      <HierarchicalSeasonSelect
        label="계절"
        value={seasons}
        onChange={setSeasons}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-primary">
          스타일
        </label>
        <div className="flex flex-wrap gap-1.5">
          {STYLES.map(({ value, label }) => (
            <Button
              key={value}
              type="button"
              variant="chip"
              size="sm"
              selected={styles.includes(value)}
              onClick={() => handleStyleToggle(value)}
              disabled={isLoading}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-primary">
          무드
        </label>
        <div className="flex flex-wrap gap-1.5">
          {MOODS.map(({ value, label }) => (
            <Button
              key={value}
              type="button"
              variant="chip"
              size="sm"
              selected={moods.includes(value)}
              onClick={() => handleMoodToggle(value)}
              disabled={isLoading}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!hasSelection || isLoading}
        isLoading={isLoading}
        className="w-full"
      >
        {submitLabel}
      </Button>

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={handlePasswordConfirm}
        title={submitLabel}
      />
    </div>
  );
};
