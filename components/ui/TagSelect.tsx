"use client";

import { cn } from "@/lib/utils";

interface TagOption<T extends string> {
  value: T;
  label: string;
}

interface TagSelectProps<T extends string> {
  label?: string;
  options: TagOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  error?: string;
  className?: string;
}

export const TagSelect = <T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  className,
}: TagSelectProps<T>) => {
  const handleToggle = (optionValue: T) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className={className}>
      {label && (
        <p className="mb-2 text-sm font-medium text-primary">{label}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                isSelected
                  ? "bg-primary text-white"
                  : "bg-secondary-3 text-primary hover:bg-secondary-2"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
