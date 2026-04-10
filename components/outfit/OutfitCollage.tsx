"use client";

import { CollageSlot } from "./CollageSlot";
import type { OutfitSelection } from "@/hooks/useOutfitBuilder";
import type { MainCategory, ClothingItem } from "@/types";

interface OutfitCollageProps {
  selection: OutfitSelection;
  onRemove?: (category: MainCategory, itemId?: string) => void;
  onItemClick?: (item: ClothingItem) => void;
  editable?: boolean;
}

export const OutfitCollage = ({
  selection,
  onRemove,
  onItemClick,
  editable = true,
}: OutfitCollageProps) => {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-secondary-3/30 p-4">
      {/* 1행: 상의, 아우터 */}
      <div className="flex items-center gap-3">
        <CollageSlot
          category="top"
          item={selection.top}
          onRemove={editable && onRemove ? () => onRemove("top") : undefined}
          onClick={onItemClick && selection.top ? () => onItemClick(selection.top!) : undefined}
          size="lg"
        />
        <CollageSlot
          category="outer"
          item={selection.outer}
          onRemove={editable && onRemove ? () => onRemove("outer") : undefined}
          onClick={onItemClick && selection.outer ? () => onItemClick(selection.outer!) : undefined}
          size="lg"
        />
      </div>

      {/* 2행: 하의 */}
      <CollageSlot
        category="bottom"
        item={selection.bottom}
        onRemove={editable && onRemove ? () => onRemove("bottom") : undefined}
        onClick={onItemClick && selection.bottom ? () => onItemClick(selection.bottom!) : undefined}
        size="lg"
      />

      {/* 3행: 신발 */}
      <CollageSlot
        category="shoes"
        item={selection.shoes}
        onRemove={editable && onRemove ? () => onRemove("shoes") : undefined}
        onClick={onItemClick && selection.shoes ? () => onItemClick(selection.shoes!) : undefined}
        size="md"
      />

      {/* 4행: 가방 + 악세사리 */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <CollageSlot
          category="bag"
          item={selection.bag}
          onRemove={editable && onRemove ? () => onRemove("bag") : undefined}
          onClick={onItemClick && selection.bag ? () => onItemClick(selection.bag!) : undefined}
          size="sm"
        />
        {selection.accessories.length > 0 ? (
          selection.accessories.map((accessory) => (
            <CollageSlot
              key={accessory.id}
              category="accessory"
              item={accessory}
              onRemove={editable && onRemove ? () => onRemove("accessory", accessory.id) : undefined}
              onClick={onItemClick ? () => onItemClick(accessory) : undefined}
              size="sm"
            />
          ))
        ) : (
          <CollageSlot category="accessory" item={null} size="sm" />
        )}
      </div>
    </div>
  );
};
