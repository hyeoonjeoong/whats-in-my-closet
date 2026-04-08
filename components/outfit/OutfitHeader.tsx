"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IconButton } from "@/components/ui";

interface OutfitHeaderProps {
  title: string;
  rightElement?: React.ReactNode;
}

export const OutfitHeader = ({ title, rightElement }: OutfitHeaderProps) => {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-sticky flex items-center justify-between bg-background px-4 py-3 border-b border-secondary-1/30">
      <div className="flex items-center gap-3">
        <IconButton
          onClick={() => router.back()}
          variant="ghost"
          size="sm"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={20} />
        </IconButton>
        <h1 className="text-lg font-semibold text-primary">{title}</h1>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </header>
  );
};
