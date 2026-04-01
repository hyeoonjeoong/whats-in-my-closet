"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type IconButtonVariant = "primary" | "secondary" | "ghost" | "dark";
type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  children: React.ReactNode;
}

const variantStyles: Record<IconButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "bg-secondary-3 text-primary hover:bg-secondary-2",
  ghost: "bg-transparent text-secondary-1 hover:bg-secondary-3 hover:text-primary",
  dark: "bg-black/50 text-white hover:bg-black/70",
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center rounded-full transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
