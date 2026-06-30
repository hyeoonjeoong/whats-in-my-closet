"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useRelatedOutfits } from "@/hooks/useRelatedOutfits";
import { OutfitCard } from "@/components/outfit";

interface RelatedOutfitsListProps {
  clothingId: string | null;
  onClose?: () => void;
}

const MAX_DISPLAY_COUNT = 6;

export const RelatedOutfitsList = ({ clothingId, onClose }: RelatedOutfitsListProps) => {
  const router = useRouter();
  const { outfits, totalCount, isLoading, error } = useRelatedOutfits(clothingId);

  const handleOutfitClick = (outfitId: string) => {
    onClose?.();
    router.push(`/outfit/${outfitId}`);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="border-t border-secondary-1/20 pt-4">
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="border-t border-secondary-1/20 pt-4">
        <p className="text-center text-sm text-danger py-4">{error}</p>
      </div>
    );
  }

  // 관련 코디가 없으면 렌더링하지 않음
  if (totalCount === 0) {
    return null;
  }

  const displayOutfits = outfits.slice(0, MAX_DISPLAY_COUNT);
  const remainingCount = totalCount - MAX_DISPLAY_COUNT;

  return (
    <div className="border-t border-secondary-1/20 pt-4">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles size={16} className="text-primary" />
        <span className="text-sm font-medium text-primary">
          이 아이템을 활용한 코디 ({totalCount})
        </span>
      </div>

      {/* 코디 그리드 */}
      <div className="grid grid-cols-3 gap-2">
        {displayOutfits.map((outfit) => (
          <OutfitCard
            key={outfit.id}
            outfit={outfit}
            onClick={() => handleOutfitClick(outfit.id)}
          />
        ))}
      </div>

      {/* 더 있어요 표시 */}
      {remainingCount > 0 && (
        <p className="text-center text-sm text-secondary-1 mt-3">
          +{remainingCount}개 더 있어요
        </p>
      )}
    </div>
  );
};
