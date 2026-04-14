"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ExternalLink, ImagePlus, X, Star, ZoomIn } from "lucide-react";
import { useClothesDetail } from "@/hooks/useClothesDetail";
import {
  Modal,
  Button,
  Input,
  HierarchicalSeasonSelect,
  HierarchicalCategorySelect,
  IconButton,
  PasswordModal,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ClothingItem, SubCategory, Season } from "@/types";

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
    setImageUrls,
    setNewImages,
    setName,
    setCategories,
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
            setImageUrls={setImageUrls}
            setNewImages={setNewImages}
            setName={setName}
            setCategories={setCategories}
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hasImages = item.imageUrls.length > 0;
  const hasMultipleImages = item.imageUrls.length > 1;

  // 아이템이 바뀌면 상태 리셋
  useEffect(() => {
    setSelectedImageIndex(0);
    setIsFullscreen(false);
  }, [item.id]);

  const handleCloseFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullscreen(false);
  };

  return (
    <div className="space-y-5">
      {/* 대표 이미지 */}
      <div
        className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group"
        onClick={() => hasImages && setIsFullscreen(true)}
      >
        {hasImages ? (
          <>
            {/* 블러 배경 */}
            <Image
              src={item.imageUrls[selectedImageIndex]}
              alt=""
              fill
              className="object-cover scale-110 blur-xl opacity-60"
              aria-hidden="true"
            />
            {/* 실제 이미지 */}
            <Image
              src={item.imageUrls[selectedImageIndex]}
              alt={item.name}
              fill
              className="object-contain relative"
            />
            {selectedImageIndex === 0 && (
              <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-1 text-xs text-white">
                <Star size={12} fill="currentColor" />
                <span>대표</span>
              </div>
            )}
            {/* 확대 아이콘 */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white opacity-70 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={14} />
              <span className="hidden sm:inline">확대</span>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-secondary-1 bg-secondary-3">
            <span className="text-6xl">👕</span>
          </div>
        )}
      </div>

      {/* 풀스크린 이미지 뷰어 */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-modal bg-black/95 flex items-center justify-center"
          onClick={handleCloseFullscreen}
        >
          {/* 닫기 버튼 */}
          <button
            type="button"
            className="absolute right-4 top-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
            onClick={handleCloseFullscreen}
            aria-label="닫기"
          >
            <X size={24} className="text-white" />
          </button>
          <Image
            src={item.imageUrls[selectedImageIndex]}
            alt={item.name}
            fill
            className="object-contain p-4 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          />
          {/* 이미지 인디케이터 */}
          {hasMultipleImages && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-3">
              {item.imageUrls.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(index);
                  }}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    selectedImageIndex === index
                      ? "bg-white scale-125"
                      : "bg-white/50 hover:bg-white/80 active:bg-white"
                  )}
                  aria-label={`이미지 ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 서브 이미지 썸네일 */}
      {hasMultipleImages && (
        <div className="grid grid-cols-4 gap-2">
          {item.imageUrls.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg cursor-pointer transition-all",
                selectedImageIndex === index
                  ? "ring-2 ring-primary ring-offset-1"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={url}
                alt={`${item.name} ${index + 1}`}
                fill
                className="object-cover"
              />
              {index === 0 && (
                <div className="absolute left-1 top-1 rounded-full bg-primary/90 p-0.5">
                  <Star size={10} fill="white" className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 정보 - 등록/수정과 동일한 UI */}
      <Input label="이름" value={item.name} disabled readOnly />

      <HierarchicalCategorySelect
        label="카테고리"
        value={item.categories}
      />

      <HierarchicalSeasonSelect
        label="계절"
        value={item.seasons}
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
    imageUrls: string[];
    newImages: File[];
    name: string;
    categories: SubCategory[];
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
  setImageUrls: (urls: string[]) => void;
  setNewImages: (files: File[]) => void;
  setName: (name: string) => void;
  setCategories: (categories: SubCategory[]) => void;
  setSeasons: (seasons: Season[]) => void;
  setPurchaseLink: (link: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EditMode = ({
  formData,
  errors,
  onSubmit,
  onCancel,
  setImageUrls,
  setNewImages,
  setName,
  setCategories,
  setSeasons,
  setPurchaseLink,
}: EditModeProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const totalImageCount = formData.imageUrls.length + formData.newImages.length;
  const canAddMore = totalImageCount < MAX_IMAGES;
  const hasMainImage = totalImageCount > 0;

  // 새 이미지 미리보기 URL 생성
  const newImagePreviews = formData.newImages.map((file) =>
    URL.createObjectURL(file)
  );

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setLocalError(null);

    if (files.length === 0) return;

    const newTotalCount = totalImageCount + files.length;
    if (newTotalCount > MAX_IMAGES) {
      setLocalError(`이미지는 최대 ${MAX_IMAGES}장까지 업로드 가능합니다`);
      return;
    }

    const invalidTypeFile = files.find(
      (file) => !ACCEPTED_TYPES.includes(file.type)
    );
    if (invalidTypeFile) {
      setLocalError("JPG, PNG, WEBP 파일만 업로드 가능합니다");
      return;
    }

    const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFile) {
      setLocalError("파일 크기는 5MB 이하여야 합니다");
      return;
    }

    setNewImages([...formData.newImages, ...files]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemoveExistingImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newUrls = formData.imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
  };

  const handleRemoveNewImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFiles = formData.newImages.filter((_, i) => i !== index);
    setNewImages(newFiles);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  // 첫 번째 이미지 (대표 이미지) 결정
  const mainImageSrc =
    formData.imageUrls.length > 0
      ? formData.imageUrls[0]
      : newImagePreviews.length > 0
        ? newImagePreviews[0]
        : null;

  const isMainImageNew = formData.imageUrls.length === 0 && newImagePreviews.length > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleAddImages}
        multiple
        className="hidden"
      />

      {/* 대표 이미지 */}
      <div
        onClick={handleClick}
        className={cn(
          "relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          hasMainImage
            ? "border-transparent"
            : "border-secondary-1/50 hover:border-primary",
          localError && "border-red-500"
        )}
      >
        {mainImageSrc ? (
          <>
            <Image
              src={mainImageSrc}
              alt="대표 이미지"
              fill
              className="object-cover"
              unoptimized={isMainImageNew}
            />
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-1 text-xs text-white">
              <Star size={12} fill="currentColor" />
              <span>대표</span>
            </div>
            {formData.imageUrls.length > 0 ? (
              <IconButton
                type="button"
                onClick={(e) => handleRemoveExistingImage(0, e)}
                variant="dark"
                size="sm"
                className="absolute right-2 top-2"
                aria-label="대표 이미지 삭제"
              >
                <X size={16} />
              </IconButton>
            ) : (
              <IconButton
                type="button"
                onClick={(e) => handleRemoveNewImage(0, e)}
                variant="dark"
                size="sm"
                className="absolute right-2 top-2"
                aria-label="대표 이미지 삭제"
              >
                <X size={16} />
              </IconButton>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-secondary-1">
            <ImagePlus size={32} />
            <span className="text-sm">이미지 선택</span>
          </div>
        )}
      </div>

      {/* 안내 문구 */}
      <p className="text-center text-xs text-secondary-1">
        JPG, PNG, WEBP (최대 5MB) · 최대 {MAX_IMAGES}장
        {hasMainImage && (
          <span className="block mt-0.5">
            첫 번째 이미지가 대표 이미지로 설정됩니다
          </span>
        )}
      </p>

      {/* 서브 이미지 그리드 */}
      {hasMainImage && (
        <div className="grid grid-cols-4 gap-2">
          {/* 기존 이미지들 (첫 번째 제외) */}
          {formData.imageUrls.slice(1).map((url, index) => (
            <div
              key={url}
              className="relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={url}
                alt={`이미지 ${index + 2}`}
                fill
                className="object-cover"
              />
              <IconButton
                type="button"
                onClick={(e) => handleRemoveExistingImage(index + 1, e)}
                variant="dark"
                size="sm"
                className="absolute right-1 top-1"
                aria-label={`이미지 ${index + 2} 삭제`}
              >
                <X size={12} />
              </IconButton>
            </div>
          ))}

          {/* 새 이미지들 (기존 이미지가 없으면 첫 번째 제외) */}
          {formData.newImages
            .slice(formData.imageUrls.length === 0 ? 1 : 0)
            .map((_, index) => {
              const actualIndex =
                formData.imageUrls.length === 0 ? index + 1 : index;
              return (
                <div
                  key={newImagePreviews[actualIndex]}
                  className="relative aspect-square overflow-hidden rounded-lg"
                >
                  <Image
                    src={newImagePreviews[actualIndex]}
                    alt={`새 이미지 ${actualIndex + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <IconButton
                    type="button"
                    onClick={(e) => handleRemoveNewImage(actualIndex, e)}
                    variant="dark"
                    size="sm"
                    className="absolute right-1 top-1"
                    aria-label={`새 이미지 ${actualIndex + 1} 삭제`}
                  >
                    <X size={12} />
                  </IconButton>
                </div>
              );
            })}

          {/* 추가 버튼 */}
          {canAddMore && (
            <div
              onClick={handleClick}
              className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-secondary-1/50 transition-colors hover:border-primary"
            >
              <ImagePlus size={20} className="text-secondary-1" />
            </div>
          )}
        </div>
      )}

      {localError && <p className="mt-2 text-sm text-red-500">{localError}</p>}

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
