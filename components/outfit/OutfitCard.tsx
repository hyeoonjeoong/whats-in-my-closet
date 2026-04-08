"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { SEASONS } from "@/lib/constants";
import type { Outfit, ClothingItem } from "@/types";

interface OutfitCardProps {
  outfit: Outfit;
  onClick?: () => void;
}

interface SlotProps {
  item: ClothingItem | undefined;
  className?: string;
}

const Slot = ({ item, className }: SlotProps) => {
  if (!item) {
    return <div className={cn("aspect-square rounded-sm", className)} />;
  }

  return (
    <div className={cn("relative aspect-square overflow-hidden rounded-sm bg-white", className)}>
      <Image
        src={item.imageUrls[0]}
        alt={item.name}
        fill
        sizes="80px"
        className="object-cover"
      />
    </div>
  );
};

export const OutfitCard = ({ outfit, onClick }: OutfitCardProps) => {
  const seasonLabels = outfit.seasons
    .map((s) => SEASONS.find((season) => season.value === s)?.label ?? s)
    .join(", ");

  // 카테고리별 아이템 분류
  const top = outfit.items.find((item) => item.category === "top");
  const outer = outfit.items.find((item) => item.category === "outer");
  const bottom = outfit.items.find((item) => item.category === "bottom");
  const shoes = outfit.items.find((item) => item.category === "shoes");
  const bag = outfit.items.find((item) => item.category === "bag");
  const accessory = outfit.items.find((item) => item.category === "accessory");

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full overflow-hidden rounded-xl bg-white shadow-sm transition-shadow",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50",
        "text-left"
      )}
    >
      {/* 콜라주 썸네일 - OutfitCollage 레이아웃 */}
      <div className="overflow-hidden bg-secondary-3/30 p-2">
        <div className="flex flex-col items-center gap-1">
          {/* 1행: 상의 | 아우터 */}
          <div className="flex justify-center gap-1">
            <Slot item={top} className="w-12" />
            <Slot item={outer} className="w-12" />
          </div>

          {/* 2행: 하의 */}
          <Slot item={bottom} className="w-12" />

          {/* 3행: 신발 */}
          <Slot item={shoes} className="w-10" />

          {/* 4행: 가방 | 악세 */}
          <div className="flex justify-center gap-1">
            <Slot item={bag} className="w-8" />
            <Slot item={accessory} className="w-8" />
          </div>
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="p-3">
        <h3 className="font-medium text-primary truncate">{outfit.name}</h3>
        {seasonLabels && (
          <p className="mt-1 text-xs text-secondary-1">{seasonLabels}</p>
        )}
      </div>
    </button>
  );
};
