"use client";

import { useState } from "react";
import { Input, Button, TagSelect, PasswordModal } from "@/components/ui";
import { SEASONS } from "@/lib/constants";
import type { Season } from "@/types";

interface OutfitSaveSectionProps {
  defaultName?: string;
  placeholderName?: string;
  defaultSeasons?: Season[];
  onSave: (data: { name: string; seasons: Season[]; password: string }) => void;
  isLoading?: boolean;
  hasSelection: boolean;
  submitLabel?: string;
}

export const OutfitSaveSection = ({
  defaultName = "",
  placeholderName = "",
  defaultSeasons = [],
  onSave,
  isLoading = false,
  hasSelection,
  submitLabel = "저장하기",
}: OutfitSaveSectionProps) => {
  const [name, setName] = useState(defaultName);
  const [seasons, setSeasons] = useState<Season[]>(defaultSeasons);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleSubmit = () => {
    if (!hasSelection) return;
    setIsPasswordModalOpen(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    const finalName = name.trim() || placeholderName || "코디";
    onSave({ name: finalName, seasons, password });
    setIsPasswordModalOpen(false);
  };

  return (
    <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
      <Input
        label="코디 이름"
        placeholder={placeholderName || "예: 봄 데일리룩"}
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isLoading}
      />

      <TagSelect
        label="계절"
        options={SEASONS}
        value={seasons}
        onChange={setSeasons}
        disabled={isLoading}
      />

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
