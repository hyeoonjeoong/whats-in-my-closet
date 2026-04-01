"use client";

import { useAddClothes } from "@/hooks/useAddClothes";
import { SEASONS, CATEGORIES } from "@/lib/constants";
import {
  Modal,
  Button,
  Input,
  ImageUpload,
  TagSelect,
  RadioGroup,
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
  const {
    formData,
    errors,
    isSubmitting,
    setImage,
    setName,
    setCategory,
    setSeasons,
    setPurchaseLink,
    submit,
    reset,
  } = useAddClothes();

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    <Modal isOpen={isOpen} onClose={handleClose} title="옷 추가">
      <form onSubmit={handleSubmit} className="space-y-5">
        <ImageUpload
          value={formData.image}
          onChange={setImage}
          error={errors.image}
        />

        <Input
          label="이름"
          placeholder="예: 화이트 오버핏 티셔츠"
          value={formData.name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          maxLength={50}
        />

        <RadioGroup
          label="카테고리"
          options={CATEGORIES}
          value={formData.category}
          onChange={setCategory}
          error={errors.category}
        />

        <TagSelect
          label="계절"
          options={SEASONS}
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

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="flex-1"
          >
            추가
          </Button>
        </div>
      </form>
    </Modal>
  );
};
