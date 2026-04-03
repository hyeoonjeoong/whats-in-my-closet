"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, ImagePlus, X } from "lucide-react";
import { useClothesDetail } from "@/hooks/useClothesDetail";
import { SEASONS, CATEGORIES } from "@/lib/constants";
import {
  Modal,
  Button,
  Input,
  TagSelect,
  RadioGroup,
  IconButton,
  PasswordModal,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ClothingItem, Category, Season } from "@/types";

interface ClothesDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  onUpdate: (item: ClothingItem) => void;
  onDelete: (itemId: string) => void;
}

export const ClothesDetailModal = ({
  isOpen,
  onClose,
  itemId,
  onUpdate,
  onDelete,
}: ClothesDetailModalProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordAction, setPasswordAction] = useState<"edit" | "delete">("edit");
  const {
    item,
    formData,
    errors,
    isLoading,
    isSubmitting,
    isDeleting,
    isEditing,
    loadItem,
    startEditing,
    cancelEditing,
    setNewImage,
    setName,
    setCategory,
    setSeasons,
    setPurchaseLink,
    submitEdit,
    deleteItem,
    reset,
    clearPasswordError,
  } = useClothesDetail();

  useEffect(() => {
    if (isOpen && itemId) {
      loadItem(itemId);
    }
  }, [isOpen, itemId, loadItem]);

  const handleClose = () => {
    reset();
    setShowDeleteConfirm(false);
    setShowPasswordModal(false);
    onClose();
  };

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordAction("edit");
    setShowPasswordModal(true);
  };

  const handleDeleteClick = () => {
    setPasswordAction("delete");
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    if (passwordAction === "edit") {
      try {
        const updatedItem = await submitEdit(password);
        setShowPasswordModal(false);
        onUpdate(updatedItem);
      } catch {
        // 에러는 useClothesDetail에서 처리됨
      }
    } else {
      if (!item) return;
      try {
        await deleteItem(password);
        setShowPasswordModal(false);
        onDelete(item.id);
        handleClose();
      } catch {
        // 에러 처리
      }
    }
  };

  const handlePasswordClose = () => {
    setShowPasswordModal(false);
    clearPasswordError();
  };

  const handleCancelEdit = () => {
    cancelEditing();
    setShowDeleteConfirm(false);
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="옷 상세">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </Modal>
    );
  }

  if (!item) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="옷 상세">
        <div className="text-center text-secondary-1 py-12">
          <p>아이템을 찾을 수 없습니다</p>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="옷 상세">
        {isEditing ? (
          <EditMode
            formData={formData}
            errors={errors}
            onSubmit={handleSubmitClick}
            onCancel={handleCancelEdit}
            setNewImage={setNewImage}
            setName={setName}
            setCategory={setCategory}
            setSeasons={setSeasons}
            setPurchaseLink={setPurchaseLink}
          />
        ) : (
          <ViewMode
            item={item}
            showDeleteConfirm={showDeleteConfirm}
            onEdit={startEditing}
            onDeleteClick={() => setShowDeleteConfirm(true)}
            onDeleteConfirm={handleDeleteClick}
            onDeleteCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </Modal>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={handlePasswordClose}
        onConfirm={handlePasswordConfirm}
        title={passwordAction === "edit" ? "수정 확인" : "삭제 확인"}
        description={
          passwordAction === "edit"
            ? "수정하려면 관리자 비밀번호를 입력해주세요"
            : "삭제하려면 관리자 비밀번호를 입력해주세요"
        }
        isLoading={passwordAction === "edit" ? isSubmitting : isDeleting}
        error={errors.password}
      />
    </>
  );
};

interface ViewModeProps {
  item: ClothingItem;
  showDeleteConfirm: boolean;
  onEdit: () => void;
  onDeleteClick: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

const ViewMode = ({
  item,
  showDeleteConfirm,
  onEdit,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel,
}: ViewModeProps) => {
  return (
    <div className="space-y-5">
      {/* 이미지 */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary-3">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-secondary-1">
            <span className="text-6xl">👕</span>
          </div>
        )}
      </div>

      {/* 정보 - 등록/수정과 동일한 UI */}
      <Input label="이름" value={item.name} disabled readOnly />

      <RadioGroup
        label="카테고리"
        options={CATEGORIES}
        value={item.category}
        disabled
      />

      <TagSelect
        label="계절"
        options={SEASONS}
        value={item.seasons}
        disabled
      />

      <div>
        <p className="mb-1.5 text-sm font-medium text-primary">
          구매 링크 (선택)
        </p>
        {item.purchaseLink ? (
          <a
            href={item.purchaseLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-secondary-1/30 bg-secondary-3 px-3 py-2 text-primary hover:underline"
          >
            <ExternalLink size={16} className="shrink-0" />
            <span className="truncate">{item.purchaseLink}</span>
          </a>
        ) : (
          <div className="rounded-lg border border-secondary-1/30 bg-secondary-3 px-3 py-2 text-secondary-1">
            없음
          </div>
        )}
      </div>

      {/* 버튼 영역 */}
      {showDeleteConfirm ? (
        <div className="space-y-2 pt-2">
          <p className="text-center text-sm text-danger">
            정말 삭제하시겠습니까?
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onDeleteCancel}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={onDeleteConfirm}
              className="flex-1"
            >
              삭제
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="danger"
            onClick={onDeleteClick}
            className="flex-1"
          >
            삭제
          </Button>
          <Button type="button" onClick={onEdit} className="flex-1">
            수정
          </Button>
        </div>
      )}
    </div>
  );
};

interface EditModeProps {
  formData: {
    imageUrl: string;
    newImage: File | null;
    name: string;
    category: Category | null;
    seasons: Season[];
    purchaseLink: string;
  };
  errors: {
    name?: string;
    category?: string;
    seasons?: string;
    purchaseLink?: string;
  };
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  setNewImage: (file: File | null) => void;
  setName: (name: string) => void;
  setCategory: (category: Category) => void;
  setSeasons: (seasons: Season[]) => void;
  setPurchaseLink: (link: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EditMode = ({
  formData,
  errors,
  onSubmit,
  onCancel,
  setNewImage,
  setName,
  setCategory,
  setSeasons,
  setPurchaseLink,
}: EditModeProps) => {
  const [localError, setLocalError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLocalError(null);

    if (!file) {
      setNewImage(null);
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError("JPG, PNG, WEBP 파일만 업로드 가능합니다");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setLocalError("파일 크기는 5MB 이하여야 합니다");
      return;
    }

    setNewImage(file);
  };

  const previewUrl = formData.newImage
    ? URL.createObjectURL(formData.newImage)
    : formData.imageUrl;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* 이미지 업로드 (기존 이미지 유지 가능) */}
      <div>
        <input
          type="file"
          id="image-edit-input"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleImageChange}
          className="hidden"
        />

        <div
          onClick={() => document.getElementById("image-edit-input")?.click()}
          className={cn(
            "relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors",
            previewUrl
              ? "border-transparent"
              : "border-secondary-1/50 hover:border-primary",
            localError && "border-red-500"
          )}
        >
          {previewUrl ? (
            <>
              <Image
                src={previewUrl}
                alt="미리보기"
                fill
                className="object-cover"
                unoptimized={!!formData.newImage}
              />
              {formData.newImage && (
                <IconButton
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewImage(null);
                  }}
                  variant="dark"
                  size="sm"
                  className="absolute right-2 top-2"
                  aria-label="새 이미지 취소"
                >
                  <X size={16} />
                </IconButton>
              )}
              <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                {formData.newImage ? "새 이미지" : "클릭하여 변경"}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-secondary-1">
              <ImagePlus size={32} />
              <span className="text-sm">이미지 선택</span>
              <span className="text-xs">JPG, PNG, WEBP (최대 5MB)</span>
            </div>
          )}
        </div>

        {localError && <p className="mt-1 text-sm text-red-500">{localError}</p>}
      </div>

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
          onClick={onCancel}
          className="flex-1"
        >
          취소
        </Button>
        <Button type="submit" className="flex-1">
          저장
        </Button>
      </div>
    </form>
  );
};
