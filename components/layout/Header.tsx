import { Plus } from "lucide-react";
import { IconButton } from "@/components/ui";

interface HeaderProps {
  onAddClick?: () => void;
}

export const Header = ({ onAddClick }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-10 border-b border-secondary-1/30 bg-background">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <h1 className="text-lg font-semibold text-primary">내 옷장</h1>
        {onAddClick && (
          <IconButton
            onClick={onAddClick}
            variant="primary"
            size="md"
            aria-label="옷 추가"
          >
            <Plus size={20} />
          </IconButton>
        )}
      </div>
    </header>
  );
};
