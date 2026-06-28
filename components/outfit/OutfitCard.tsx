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
  if (!item) return null;

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

  // 행 개수 계산 (실제 렌더링되는 행)
  const hasRow1 = top || outer;
  const hasRow2 = bottom;
  const hasRow3 = shoes;
  const hasRow4 = bag || accessory;
  const rowCount = [hasRow1, hasRow2, hasRow3, hasRow4].filter(Boolean).length;

  // 행 개수에 따른 슬롯 크기 결정
  const getSlotSize = (baseSize: number): string => {
    if (rowCount === 1) return "w-20"; // 1행: 가장 크게
    if (rowCount === 2) return "w-16"; // 2행: 크게
    if (rowCount === 3) return "w-14"; // 3행: 중간
    return `w-${baseSize}`;            // 4행: 기본
  };

  const mainSlotSize = getSlotSize(12);
  const shoesSlotSize = getSlotSize(10);
  const accSlotSize = getSlotSize(8);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full overflow-hidden rounded-xl bg-white shadow-sm transition-shadow",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50",
        "text-left flex flex-col"
      )}
    >
      {/* 콜라주 썸네일 - 고정 높이, 기존 레이아웃 유지 */}
      <div className="aspect-square overflow-hidden bg-white p-3">
        <div className="flex flex-col items-center justify-center gap-1.5 h-full">
          {/* 1행: 상의 | 아우터 */}
          {hasRow1 && (
            top && outer ? (
              <div className="flex justify-center gap-1">
                <Slot item={top} className={mainSlotSize} />
                <Slot item={outer} className={mainSlotSize} />
              </div>
            ) : (
              <Slot item={top || outer} className={mainSlotSize} />
            )
          )}

          {/* 2행: 하의 */}
          {hasRow2 && <Slot item={bottom} className={mainSlotSize} />}

          {/* 3행: 신발 */}
          {hasRow3 && <Slot item={shoes} className={shoesSlotSize} />}

          {/* 4행: 가방 | 악세 */}
          {hasRow4 && (
            bag && accessory ? (
              <div className="flex justify-center gap-1">
                <Slot item={bag} className={accSlotSize} />
                <Slot item={accessory} className={accSlotSize} />
              </div>
            ) : (
              <Slot item={bag || accessory} className={accSlotSize} />
            )
          )}
        </div>
      </div>
    </button>
  );
};
