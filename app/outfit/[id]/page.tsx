"use client";

import { useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { Shirt, Info, Pencil, Trash2 } from "lucide-react";
import {
  OutfitHeader,
  OutfitCollage,
} from "@/components/outfit";
import { ClothesDetailModal } from "@/components/closet";
import { Button, PasswordModal, useToast } from "@/components/ui";
import { SEASONS, STYLES, MOODS, SUB_TO_MAIN_CATEGORY } from "@/lib/constants";
import type { MainCategory } from "@/types";
import { useOutfitDetail } from "@/hooks/useOutfits";
import { deleteOutfitAction } from "@/lib/actions/outfits";
import type { OutfitSelection } from "@/hooks/useOutfitBuilder";
import type { ClothingItem } from "@/types";

interface OutfitDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OutfitDetailPage({ params }: OutfitDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { outfit, isLoading, error } = useOutfitDetail(id);
  const { showToast } = useToast();

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selection = useMemo((): OutfitSelection => {
    if (!outfit) {
      return {
        top: null,
        outer: null,
        bottom: null,
        shoes: null,
        bag: null,
        accessories: [],
      };
    }

    const result: OutfitSelection = {
      top: null,
      outer: null,
      bottom: null,
      shoes: null,
      bag: null,
      accessories: [],
    };

    for (const item of outfit.items) {
      // 첫 번째 하위 카테고리의 상위 카테고리 결정
      const mainCategory: MainCategory =
        item.categories.length > 0
          ? SUB_TO_MAIN_CATEGORY[item.categories[0]]
          : "accessory";

      if (mainCategory === "accessory") {
        result.accessories.push(item);
      } else {
        const key = mainCategory as keyof Omit<OutfitSelection, "accessories">;
        result[key] = item;
      }
    }

    return result;
  }, [outfit]);

  const handleItemClick = (item: ClothingItem) => {
    setSelectedItemId(item.id);
  };

  const handleCloseItemModal = () => {
    setSelectedItemId(null);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirmClick = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("password", password);

      const result = await deleteOutfitAction(formData);

      if (result.success) {
        showToast("코디가 삭제되었습니다", "success");
        router.push("/outfits");
      } else {
        showToast(result.error || "코디 삭제에 실패했습니다", "error");
      }
    } catch {
      showToast("코디 삭제 중 오류가 발생했습니다", "error");
    } finally {
      setIsDeleting(false);
      setShowPasswordModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <OutfitHeader title="코디 상세" />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !outfit) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <OutfitHeader title="코디 상세" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-red-500">{error || "코디를 찾을 수 없습니다"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <OutfitHeader title="코디 상세" />

      <main className="flex-1 p-4 space-y-6">
        {/* 상단 섹션: 코디 구성 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Shirt size={18} />
            <h2 className="font-semibold">코디 구성</h2>
          </div>

          {/* 콜라주 */}
          <OutfitCollage
            selection={selection}
            onItemClick={handleItemClick}
            editable={false}
          />
        </section>

        {/* 구분선 */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-secondary-1/30" />
          <span className="text-xs text-secondary-1">코디 정보</span>
          <div className="h-px flex-1 bg-secondary-1/30" />
        </div>

        {/* 하단 섹션: 코디 정보 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Info size={18} />
            <h2 className="font-semibold">코디 정보</h2>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
            <div>
              <p className="text-xs text-secondary-1">코디 이름</p>
              <p className="text-sm font-medium text-primary">{outfit.name}</p>
            </div>
            {outfit.seasons.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-secondary-1">계절</p>
                <div className="flex flex-wrap gap-1.5">
                  {outfit.seasons.map((season) => (
                    <Button
                      key={season}
                      variant="chip"
                      size="sm"
                      selected
                      className="pointer-events-none"
                    >
                      {SEASONS.find((s) => s.value === season)?.label ?? season}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {outfit.styles.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-secondary-1">스타일</p>
                <div className="flex flex-wrap gap-1.5">
                  {outfit.styles.map((style) => (
                    <Button
                      key={style}
                      variant="chip"
                      size="sm"
                      selected
                      className="pointer-events-none"
                    >
                      {STYLES.find((s) => s.value === style)?.label ?? style}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {outfit.moods.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-secondary-1">무드</p>
                <div className="flex flex-wrap gap-1.5">
                  {outfit.moods.map((mood) => (
                    <Button
                      key={mood}
                      variant="chip"
                      size="sm"
                      selected
                      className="pointer-events-none"
                    >
                      {MOODS.find((m) => m.value === mood)?.label ?? mood}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 버튼 영역 */}
        {showDeleteConfirm ? (
          <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
            <p className="text-center text-sm text-danger">
              정말 이 코디를 삭제하시겠습니까?
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirmClick}
                className="flex-1"
              >
                삭제
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={() => router.push(`/outfit/${id}/edit`)}
              className="flex-1"
            >
              <Pencil size={18} className="mr-2" />
              수정하기
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteClick}
              className="flex-1"
            >
              <Trash2 size={18} className="mr-2" />
              삭제하기
            </Button>
          </div>
        )}
      </main>

      {/* 옷 상세 모달 */}
      <ClothesDetailModal
        isOpen={selectedItemId !== null}
        onClose={handleCloseItemModal}
        itemId={selectedItemId}
        onUpdate={() => {}}
        onDelete={() => {}}
      />

      {/* 비밀번호 모달 */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordConfirm}
        title="코디 삭제"
        description="삭제하려면 관리자 비밀번호를 입력해주세요"
        isLoading={isDeleting}
      />
    </div>
  );
}
