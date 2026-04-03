"use client";

import { Button } from "./Button";

interface RadioOption<T extends string> {
  value: T;
  label: string;
}

interface RadioGroupProps<T extends string> {
  label?: string;
  options: RadioOption<T>[];
  value: T | null;
  onChange?: (value: T) => void;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export const RadioGroup = <T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  className,
  disabled = false,
}: RadioGroupProps<T>) => {
  return (
    <div className={className}>
      {label && (
        <p className="mb-2 text-sm font-medium text-primary">{label}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant="chip"
            selected={value === option.value}
            onClick={() => onChange?.(option.value)}
            disabled={disabled}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
