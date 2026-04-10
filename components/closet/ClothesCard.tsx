"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { ClothingItem } from "@/types";
import { SEASONS, ALL_SEASONS, getSubCategoryLabel } from "@/lib/constants";

interface ClothesCardProps {
  item: ClothingItem;
  onClick?: () => void;
}

export const ClothesCard = ({ item, onClick }: ClothesCardProps) => {
  // 카테고리 라벨 (다중 카테고리면 +N 표시)
  const categoryLabel = item.categories.length > 0
    ? getSubCategoryLabel(item.categories[0])
    : "";
  const categoryExtra = item.categories.length > 1 ? ` +${item.categories.length - 1}` : "";

  // 계절 라벨 (전체 선택 시 "계절무관")
  const isAllSeasons = ALL_SEASONS.every((s) => item.seasons.includes(s));
  const seasonLabel = isAllSeasons
    ? "계절무관"
    : item.seasons
        .map((s) => SEASONS.find((season) => season.value === s)?.label ?? s)
        .join(", ");

  return (
    <div
      className="group relative overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      {/* 이미지 영역 - 대표 이미지 (첫 번째) 표시 */}
      <div className="relative aspect-square overflow-hidden bg-secondary-3">
        {item.imageUrls.length > 0 ? (
          <Image
            src={item.imageUrls[0]}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-secondary-1">
            <span className="text-4xl">👕</span>
          </div>
        )}
        {/* 다중 이미지 인디케이터 */}
        {item.imageUrls.length > 1 && (
          <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            +{item.imageUrls.length - 1}
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="p-3">
        <h3 className="font-medium text-primary truncate">{item.name}</h3>
        <div className="mt-1 space-y-0.5 text-xs text-secondary-1">
          <p className="truncate">{categoryLabel}{categoryExtra}</p>
          <p className="truncate">{seasonLabel}</p>
        </div>
      </div>

      {/* 구매 링크 아이콘 */}
      {item.purchaseLink && (
        <a
          href={item.purchaseLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 text-primary opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
        >
          <ExternalLink size={16} />
        </a>
      )}
    </div>
  );
}
