"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "chip";
type ButtonSize = "sm" | "md" | "lg" | "chip";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  selected?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "bg-secondary-3 text-primary hover:bg-secondary-2",
  ghost: "bg-transparent text-primary hover:bg-secondary-3",
  danger: "bg-red-500 text-white hover:bg-red-600",
  chip: "", // selected prop에 따라 동적으로 적용
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
  chip: "px-4 py-1.5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      selected = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isChip = variant === "chip";
    const chipStyle = isChip
      ? selected
        ? "bg-primary text-white"
        : "bg-secondary-3 text-primary hover:bg-secondary-2"
      : "";

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isChip ? "rounded-full" : "rounded-lg",
          isChip ? chipStyle : variantStyles[variant],
          sizeStyles[isChip ? "chip" : size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
