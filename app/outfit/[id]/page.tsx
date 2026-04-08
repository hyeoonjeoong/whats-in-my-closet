"use client";

import { useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import {
  OutfitHeader,
  OutfitCollage,
} from "@/components/outfit";
import { ClothesDetailModal } from "@/components/closet";
import { Button, IconButton, PasswordModal, useToast } from "@/components/ui";
import { SEASONS } from "@/lib/constants";
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
      if (item.category === "accessory") {
        result.accessories.push(item);
      } else {
        const key = item.category as keyof Omit<OutfitSelection, "accessories">;
        result[key] = item;
      }
    }

    return result;
  }, [outfit]);

  const seasonLabels = outfit?.seasons
    .map((s) => SEASONS.find((season) => season.value === s)?.label ?? s)
    .join(", ");

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
      <OutfitHeader
        title="코디 상세"
        rightElement={
          <IconButton
            onClick={() => router.push(`/outfit/${id}/edit`)}
            variant="ghost"
            size="sm"
            aria-label="수정"
          >
            <Pencil size={20} />
          </IconButton>
        }
      />

      <main className="flex-1 space-y-6 p-4">
        {/* 코디 정보 */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">{outfit.name}</h2>
          {seasonLabels && (
            <p className="mt-1 text-sm text-secondary-1">{seasonLabels}</p>
          )}
        </div>

        {/* 콜라주 */}
        <OutfitCollage
          selection={selection}
          onItemClick={handleItemClick}
          editable={false}
        />

        {/* 삭제 버튼 영역 */}
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
          <Button
            variant="danger"
            onClick={handleDeleteClick}
            className="w-full"
          >
            <Trash2 size={18} className="mr-2" />
            코디 삭제
          </Button>
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
