"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAddClothes } from "@/hooks/useAddClothes";
import {
  Modal,
  Button,
  Input,
  MultiImageUpload,
  HierarchicalSeasonSelect,
  HierarchicalCategorySelect,
  LoginRequiredModal,
} from "@/components/ui";
import type { ClothingItem } from "@/types";

interface AddClothesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: ClothingItem) => void;
}

export const AddClothesModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AddClothesModalProps) => {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const {
    formData,
    errors,
    isSubmitting,
    setImages,
    setName,
    setCategories,
    setSeasons,
    setPurchaseLink,
    validate,
    submit,
    reset,
  } = useAddClothes();

  const handleClose = () => {
    reset();
    setShowLoginModal(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // 비로그인 시 로그인 유도 모달
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      const newItem = await submit();
      reset();
      onSuccess(newItem);
      onClose();
    } catch {
      // 에러는 useAddClothes에서 처리됨
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="옷 추가">
        {/* 비로그인 안내 배너 */}
        {!user && (
          <div className="mb-4 rounded-lg bg-secondary-2 px-3 py-2 text-center text-sm text-primary">
            👀 로그인하면 내 옷장에 저장돼요
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <MultiImageUpload
            value={formData.images}
            onChange={setImages}
            error={errors.images}
          />

          <Input
            label="이름"
            placeholder="예: 화이트 오버핏 티셔츠"
            value={formData.name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            maxLength={50}
          />

          <HierarchicalCategorySelect
            label="카테고리"
            value={formData.categories}
            onChange={setCategories}
            error={errors.category}
          />

          <HierarchicalSeasonSelect
            label="계절"
            value={formData.seasons}
            onChange={setSeasons}
            error={errors.seasons}
          />

          <Input
            label="구매 링크 (선택)"
            placeholder="https://..."
            value={formData.purchaseLink}
            onChange={(e) => setPurchaseLink(e.target.value)}
            error={errors.purchaseLink}
          />

          {errors.submit && (
            <p className="text-sm text-danger">{errors.submit}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "추가 중..." : "추가"}
            </Button>
          </div>
        </form>
      </Modal>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="로그인이 필요해요"
        description="옷을 추가하려면 로그인해주세요"
      />
    </>
  );
};
