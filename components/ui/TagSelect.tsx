"use client";

import { Button } from "./Button";

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
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant="chip"
            selected={value.includes(option.value)}
            onClick={() => handleToggle(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
