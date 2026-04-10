"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClothingItem, MainCategory } from "@/types";
import { MAIN_CATEGORIES } from "@/lib/constants";

interface CollageSlotProps {
  category: MainCategory;
  item: ClothingItem | null;
  onRemove?: () => void;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

export const CollageSlot = ({
  category,
  item,
  onRemove,
  onClick,
  size = "md",
  className,
}: CollageSlotProps) => {
  const categoryLabel = MAIN_CATEGORIES.find((c) => c.value === category)?.label ?? category;

  if (!item) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border-2 border-dashed border-secondary-1/50 bg-secondary-3/50",
          sizeStyles[size],
          className
        )}
      >
        <span className="text-xs text-secondary-1">{categoryLabel}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-white shadow-sm",
        onClick && "cursor-pointer",
        sizeStyles[size],
        className
      )}
      onClick={onClick}
    >
      <Image
        src={item.imageUrls[0]}
        alt={item.name}
        fill
        sizes="128px"
        className="object-cover"
      />
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80 transition-colors"
          aria-label="제거"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
