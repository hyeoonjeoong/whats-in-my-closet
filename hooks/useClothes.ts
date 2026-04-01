"use client";

import { useState, useEffect, useCallback } from "react";
import { getClothes, deleteClothes } from "@/lib/api/clothes";
import type { ClothingItem } from "@/types";

interface UseClothesReturn {
  clothes: ClothingItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeClothes: (id: string) => Promise<void>;
}

export const useClothes = (): UseClothesReturn => {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClothes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getClothes();
      setClothes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "옷 목록을 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeClothes = useCallback(async (id: string) => {
    try {
      await deleteClothes(id);
      setClothes((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error("옷 삭제에 실패했습니다");
    }
  }, []);

  useEffect(() => {
    fetchClothes();
  }, [fetchClothes]);

  return {
    clothes,
    isLoading,
    error,
    refetch: fetchClothes,
    removeClothes,
  };
};
