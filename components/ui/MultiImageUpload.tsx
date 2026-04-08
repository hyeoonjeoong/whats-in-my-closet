"use client";

import { useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import { ImagePlus, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "./IconButton";
import { useToast } from "./Toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGES = 5;

interface MultiImageUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  error?: string;
  className?: string;
}

export const MultiImageUpload = ({
  value,
  onChange,
  error,
  className,
}: MultiImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const previews = useMemo(() => {
    return value.map((file) => URL.createObjectURL(file));
  }, [value]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const totalCount = value.length + files.length;
    if (totalCount > MAX_IMAGES) {
      showToast(`이미지는 최대 ${MAX_IMAGES}장까지 업로드 가능합니다`, "error");
      return;
    }

    const invalidTypeFile = files.find(
      (file) => !ACCEPTED_TYPES.includes(file.type)
    );
    if (invalidTypeFile) {
      showToast("JPG, PNG, WEBP 파일만 업로드 가능합니다", "error");
      return;
    }

    const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFile) {
      showToast("파일 크기는 5MB 이하여야 합니다", "error");
      return;
    }

    onChange([...value, ...files]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemove = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const hasMainImage = value.length > 0;
  const subImages = value.slice(1);
  const canAddMore = value.length < MAX_IMAGES;

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleChange}
        multiple
        className="hidden"
      />

      {/* 대표 이미지 영역 */}
      <div
        onClick={handleClick}
        className={cn(
          "relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          hasMainImage
            ? "border-transparent"
            : "border-secondary-1/50 hover:border-primary",
          error && "border-red-500"
        )}
      >
        {hasMainImage ? (
          <>
            <Image
              src={previews[0]}
              alt="대표 이미지"
              fill
              className="object-cover"
              unoptimized
            />
            <IconButton
              type="button"
              onClick={(e) => handleRemove(0, e)}
              variant="dark"
              size="sm"
              className="absolute right-2 top-2"
              aria-label="대표 이미지 삭제"
            >
              <X size={16} />
            </IconButton>
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-1 text-xs text-white">
              <Star size={12} fill="currentColor" />
              <span>대표</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-secondary-1">
            <ImagePlus size={32} />
            <span className="text-sm">이미지 선택</span>
          </div>
        )}
      </div>

      {/* 안내 문구 */}
      <p className="mt-2 text-center text-xs text-secondary-1">
        JPG, PNG, WEBP (최대 5MB) · 최대 {MAX_IMAGES}장
        {hasMainImage && (
          <span className="block mt-0.5">
            첫 번째 이미지가 대표 이미지로 설정됩니다
          </span>
        )}
      </p>

      {/* 서브 이미지 그리드 */}
      {hasMainImage && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {subImages.map((_, index) => (
            <div
              key={previews[index + 1]}
              className="relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={previews[index + 1]}
                alt={`이미지 ${index + 2}`}
                fill
                className="object-cover"
                unoptimized
              />
              <IconButton
                type="button"
                onClick={(e) => handleRemove(index + 1, e)}
                variant="dark"
                size="sm"
                className="absolute right-1 top-1"
                aria-label={`이미지 ${index + 2} 삭제`}
              >
                <X size={12} />
              </IconButton>
            </div>
          ))}

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

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
