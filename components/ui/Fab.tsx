"use client";

import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
}

export const Fab = forwardRef<HTMLButtonElement, FabProps>(
  ({ className, icon: Icon, label, ...props }, ref) => {
    return (
      <div className="fixed bottom-20 inset-x-0 z-fixed pointer-events-none">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex justify-end">
            <button
              ref={ref}
              className={cn(
                "pointer-events-auto inline-flex cursor-pointer items-center gap-2",
                "rounded-full bg-primary px-4 py-3 text-white shadow-lg",
                "transition-colors hover:bg-primary/90",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                className
              )}
              {...props}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

Fab.displayName = "Fab";
