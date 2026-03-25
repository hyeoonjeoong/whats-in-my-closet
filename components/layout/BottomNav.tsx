"use client";

import { Shirt, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: "closet" | "outfits";
  onTabChange: (tab: "closet" | "outfits") => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="sticky bottom-0 z-10 border-t border-secondary-1/30 bg-background">
      <div className="mx-auto flex h-16 max-w-3xl">
        <button
          onClick={() => onTabChange("closet")}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
            activeTab === "closet"
              ? "text-primary"
              : "text-secondary-1"
          )}
        >
          <Shirt className="h-6 w-6" />
          <span className="text-xs font-medium">옷장</span>
        </button>
        <button
          onClick={() => onTabChange("outfits")}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
            activeTab === "outfits"
              ? "text-primary"
              : "text-secondary-1"
          )}
        >
          <Palette className="h-6 w-6" />
          <span className="text-xs font-medium">코디</span>
        </button>
      </div>
    </nav>
  );
}
