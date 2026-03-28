"use client";

import { ExternalLink } from "lucide-react";
import type { ClothingItem } from "@/types";
import { SEASONS, CATEGORIES } from "@/lib/constants";

interface ClothesCardProps {
  item: ClothingItem;
  onClick?: () => void;
}

export function ClothesCard({ item, onClick }: ClothesCardProps) {
  const categoryLabel =
    CATEGORIES.find((c) => c.value === item.category)?.label ?? item.category;

  const seasonLabels = item.seasons
    .map((s) => SEASONS.find((season) => season.value === s)?.label ?? s)
    .join(", ");

  return (
    <div
      className="group relative overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      {/* 이미지 영역 */}
      <div className="aspect-square overflow-hidden bg-secondary-3">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-secondary-1">
            <span className="text-4xl">👕</span>
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="p-3">
        <h3 className="font-medium text-primary truncate">{item.name}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-secondary-1">
          <span className="rounded-full bg-secondary-3 px-2 py-0.5">
            {categoryLabel}
          </span>
          <span>{seasonLabels}</span>
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
