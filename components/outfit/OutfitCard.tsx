"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { SUB_TO_MAIN_CATEGORY } from "@/lib/constants";
import type { Outfit, ClothingItem, MainCategory } from "@/types";

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
  // 아이템의 메인 카테고리 결정
  const getMainCategory = (item: ClothingItem): MainCategory => {
    if (item.categories.length === 0) return "accessory";
    return SUB_TO_MAIN_CATEGORY[item.categories[0]];
  };

  // 카테고리별 아이템 분류
  const top = outfit.items.find((item) => getMainCategory(item) === "top");
  const outer = outfit.items.find((item) => getMainCategory(item) === "outer");
  const bottom = outfit.items.find((item) => getMainCategory(item) === "bottom");
  const shoes = outfit.items.find((item) => getMainCategory(item) === "shoes");
  const bag = outfit.items.find((item) => getMainCategory(item) === "bag");
  const accessory = outfit.items.find((item) => getMainCategory(item) === "accessory");

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
      {/* 콜라주 썸네일 - 등록된 아이템만 표시 */}
      <div className="overflow-hidden bg-secondary-3/30 p-3">
        <div className="flex flex-col items-center gap-1.5">
          {/* 1행: 상의 | 아우터 */}
          {(top || outer) && (
            top && outer ? (
              <div className="flex justify-center gap-1">
                <Slot item={top} className="w-12" />
                <Slot item={outer} className="w-12" />
              </div>
            ) : (
              <Slot item={top || outer} className="w-12" />
            )
          )}

          {/* 2행: 하의 */}
          {bottom && <Slot item={bottom} className="w-12" />}

          {/* 3행: 신발 */}
          {shoes && <Slot item={shoes} className="w-10" />}

          {/* 4행: 가방 | 악세 */}
          {(bag || accessory) && (
            bag && accessory ? (
              <div className="flex justify-center gap-1">
                <Slot item={bag} className="w-8" />
                <Slot item={accessory} className="w-8" />
              </div>
            ) : (
              <Slot item={bag || accessory} className="w-8" />
            )
          )}
        </div>
      </div>

      {/* 정보 영역 - 컴팩트하게 */}
      <div className="px-2 py-1.5">
        <p className="text-xs font-medium text-primary truncate">{outfit.name}</p>
      </div>
    </button>
  );
};
