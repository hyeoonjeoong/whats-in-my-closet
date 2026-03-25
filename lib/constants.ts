import type { Season, Category } from "@/types";

export const SEASONS: { value: Season; label: string }[] = [
  { value: "spring", label: "봄" },
  { value: "summer", label: "여름" },
  { value: "fall", label: "가을" },
  { value: "winter", label: "겨울" },
];

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "top", label: "상의" },
  { value: "bottom", label: "하의" },
  { value: "outer", label: "아우터" },
  { value: "accessory", label: "악세사리" },
  { value: "shoes", label: "신발" },
  { value: "bag", label: "가방" },
];
