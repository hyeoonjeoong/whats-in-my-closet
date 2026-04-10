"use client";

import { Button } from "./Button";
import { MAIN_CATEGORIES, CATEGORY_HIERARCHY, getSubCategoriesOf } from "@/lib/constants";
import type { MainCategory, SubCategory } from "@/types";
import { cn } from "@/lib/utils";

interface HierarchicalCategorySelectProps {
  label?: string;
  value: SubCategory[];
  onChange?: (value: SubCategory[]) => void;
  error?: string;
}

export const HierarchicalCategorySelect = ({
  label,
  value,
  onChange,
  error,
}: HierarchicalCategorySelectProps) => {
  const handleSubCategoryToggle = (category: SubCategory) => {
    if (value.includes(category)) {
      onChange?.(value.filter((c) => c !== category));
    } else {
      onChange?.([...value, category]);
    }
  };

  const handleMainCategoryToggle = (mainCategory: MainCategory) => {
    const subCategories = getSubCategoriesOf(mainCategory);
    const allSelected = subCategories.every((sub) => value.includes(sub));

    if (allSelected) {
      // 전체 해제
      onChange?.(value.filter((c) => !subCategories.includes(c)));
    } else {
      // 전체 선택
      const newValue = new Set([...value, ...subCategories]);
      onChange?.(Array.from(newValue));
    }
  };

  const isMainCategoryFullySelected = (mainCategory: MainCategory): boolean => {
    const subCategories = getSubCategoriesOf(mainCategory);
    return subCategories.every((sub) => value.includes(sub));
  };

  const isMainCategoryPartiallySelected = (mainCategory: MainCategory): boolean => {
    const subCategories = getSubCategoriesOf(mainCategory);
    const selectedCount = subCategories.filter((sub) => value.includes(sub)).length;
    return selectedCount > 0 && selectedCount < subCategories.length;
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-primary">
          {label}
        </label>
      )}

      <div className="space-y-2">
        {MAIN_CATEGORIES.map(({ value: mainValue, label: mainLabel }) => {
          const isFullySelected = isMainCategoryFullySelected(mainValue);
          const isPartiallySelected = isMainCategoryPartiallySelected(mainValue);
          const subCategories = CATEGORY_HIERARCHY[mainValue];

          return (
            <div key={mainValue} className="flex items-center gap-2">
              {/* 최상위 카테고리 버튼 - 고정 */}
              <button
                type="button"
                onClick={() => handleMainCategoryToggle(mainValue)}
                className={cn(
                  "text-sm font-medium shrink-0 w-14 text-left cursor-pointer transition-colors",
                  isFullySelected
                    ? "text-primary"
                    : isPartiallySelected
                      ? "text-primary/70"
                      : "text-secondary-1"
                )}
              >
                {mainLabel}
              </button>

              <div className="h-4 w-px bg-secondary-1/50 shrink-0" />

              {/* 하위 카테고리 버튼들 - 스크롤 영역 */}
              <div className="overflow-x-auto scrollbar-hide flex-1 -mr-1 pr-1">
                <div className="flex gap-1.5 min-w-max">
                  {subCategories.map(({ value: subValue, label: subLabel }) => (
                    <Button
                      key={subValue}
                      type="button"
                      variant="chip"
                      size="sm"
                      selected={value.includes(subValue)}
                      onClick={() => handleSubCategoryToggle(subValue)}
                    >
                      {subLabel}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
};
