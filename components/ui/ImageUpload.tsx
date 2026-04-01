"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ImageUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  className?: string;
}

export const ImageUpload = ({
  value,
  onChange,
  error,
  className,
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (!value) return null;
    return URL.createObjectURL(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLocalError(null);

    if (!file) {
      onChange(null);
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

    onChange(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const displayError = error || localError;

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleChange}
        className="hidden"
      />

      <div
        onClick={handleClick}
        className={cn(
          "relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          preview
            ? "border-transparent"
            : "border-secondary-1/50 hover:border-primary",
          displayError && "border-red-500"
        )}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="미리보기"
              fill
              className="object-cover"
              unoptimized
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
              aria-label="이미지 삭제"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-secondary-1">
            <ImagePlus size={32} />
            <span className="text-sm">이미지 선택</span>
            <span className="text-xs">JPG, PNG, WEBP (최대 5MB)</span>
          </div>
        )}
      </div>

      {displayError && (
        <p className="mt-1 text-sm text-red-500">{displayError}</p>
      )}
    </div>
  );
};
