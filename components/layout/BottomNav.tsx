"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shirt, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/closet", icon: Shirt, label: "옷장" },
  { href: "/outfits", icon: Palette, label: "코디" },
] as const;

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-fixed border-t border-secondary-1/30 bg-background">
      <div className="mx-auto flex h-16 max-w-3xl">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-secondary-1"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
