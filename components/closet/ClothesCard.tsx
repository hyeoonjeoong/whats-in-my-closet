"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { ClothingItem } from "@/types";
import { SEASONS, ALL_SEASONS, getSubCategoryLabel } from "@/lib/constants";

interface ClothesCardProps {
  item: ClothingItem;
  onClick?: () => void;
}

export const ClothesCard = ({ item, onClick }: ClothesCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(item.categories.length);

  // 계절 라벨 (전체 선택 시 "계절무관")
  const isAllSeasons = ALL_SEASONS.every((s) => item.seasons.includes(s));
  const seasonLabel = isAllSeasons
    ? "계절무관"
    : item.seasons
        .map((s) => SEASONS.find((season) => season.value === s)?.label ?? s)
        .join(", ");

  // 카테고리 라벨 배열
  const categoryLabels = item.categories.map((c) => getSubCategoryLabel(c));

  useEffect(() => {
    const calculateVisibleCount = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const badges = container.querySelectorAll<HTMLElement>("[data-badge]");
      const moreIndicator = container.querySelector<HTMLElement>("[data-more]");

      let totalWidth = 0;
      let count = 0;
      const gap = 4; // gap-1 = 4px
      const moreWidth = moreIndicator?.offsetWidth ?? 24;

      badges.forEach((badge, index) => {
        const badgeWidth = badge.scrollWidth;
        const nextWidth = totalWidth + badgeWidth + (count > 0 ? gap : 0);

        // 마지막 뱃지가 아니면 +N 영역 고려
        const isLast = index === badges.length - 1;
        const reservedWidth = isLast ? 0 : moreWidth + gap;

        if (nextWidth + reservedWidth <= containerWidth) {
          totalWidth = nextWidth;
          count++;
        }
      });

      setVisibleCount(Math.max(1, count));
    };

    calculateVisibleCount();

    const resizeObserver = new ResizeObserver(calculateVisibleCount);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [categoryLabels.length]);

  const hiddenCount = categoryLabels.length - visibleCount;

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
        <div className="mt-1.5 space-y-1">
          {/* 카테고리 뱃지 */}
          <div ref={containerRef} className="flex items-center gap-1 overflow-hidden">
            {categoryLabels.map((label, index) => (
              <span
                key={label}
                data-badge
                className={`shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary ${
                  index >= visibleCount ? "invisible absolute" : ""
                }`}
              >
                {label}
              </span>
            ))}
            {hiddenCount > 0 && (
              <span
                data-more
                className="shrink-0 rounded-full bg-secondary-1/20 px-1.5 py-0.5 text-xs text-secondary-1"
              >
                +{hiddenCount}
              </span>
            )}
          </div>
          {/* 계절 */}
          <p className="text-xs text-secondary-1 truncate">{seasonLabel}</p>
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
