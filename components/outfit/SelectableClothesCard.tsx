"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClothingItem } from "@/types";

interface SelectableClothesCardProps {
  item: ClothingItem;
  isSelected: boolean;
  onClick: () => void;
}

export const SelectableClothesCard = ({
  item,
  isSelected,
  onClick,
}: SelectableClothesCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl bg-white shadow-sm transition-all",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50",
        isSelected && "ring-2 ring-primary"
      )}
    >
      {/* 이미지 영역 */}
      <div className="relative aspect-square overflow-hidden bg-secondary-3">
        {item.imageUrls.length > 0 ? (
          <Image
            src={item.imageUrls[0]}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 33vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-secondary-1">
            <span className="text-2xl">👕</span>
          </div>
        )}

        {/* 선택 오버레이 */}
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/40">
            <div className="rounded-full bg-white p-1">
              <Check size={20} className="text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* 이름 */}
      <div className="p-2">
        <p className="truncate text-xs font-medium text-primary">{item.name}</p>
      </div>
    </button>
  );
};
