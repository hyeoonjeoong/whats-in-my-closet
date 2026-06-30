"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchOutfitsByClothingIdAction } from "@/lib/actions/outfits";
import type { Outfit } from "@/types";

interface UseRelatedOutfitsReturn {
  outfits: Outfit[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRelatedOutfits = (clothingId: string | null): UseRelatedOutfitsReturn => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelatedOutfits = useCallback(async () => {
    if (!clothingId) {
      setOutfits([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchOutfitsByClothingIdAction(clothingId);
      if (result.success && result.data) {
        setOutfits(result.data);
      } else {
        setError(result.error || "관련 코디를 불러오는데 실패했습니다");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "관련 코디를 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  }, [clothingId]);

  useEffect(() => {
    fetchRelatedOutfits();
  }, [fetchRelatedOutfits]);

  return {
    outfits,
    totalCount: outfits.length,
    isLoading,
    error,
    refetch: fetchRelatedOutfits,
  };
};
