"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchClothesAction } from "@/lib/actions/clothes";
import type { ClothingItem } from "@/types";

interface UseClothesReturn {
  clothes: ClothingItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeItem: (id: string) => void;
}

export const useClothes = (): UseClothesReturn => {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClothes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchClothesAction();
      if (result.success && result.data) {
        setClothes(result.data);
      } else {
        setError(result.error || "옷 목록을 불러오는데 실패했습니다");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "옷 목록을 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setClothes((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    fetchClothes();
  }, [fetchClothes]);

  return {
    clothes,
    isLoading,
    error,
    refetch: fetchClothes,
    removeItem,
  };
};
