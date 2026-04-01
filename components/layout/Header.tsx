import { Plus } from "lucide-react";

interface HeaderProps {
  onAddClick?: () => void;
}

export const Header = ({ onAddClick }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-10 border-b border-secondary-1/30 bg-background">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <h1 className="text-lg font-semibold text-primary">내 옷장</h1>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90"
            aria-label="옷 추가"
          >
            <Plus size={20} />
          </button>
        )}
      </div>
    </header>
  );
}
