"use client";

import { useState, useEffect, useCallback } from "react";
import { getOutfits, getOutfitById } from "@/lib/api/outfits";
import type { Outfit } from "@/types";

interface UseOutfitsReturn {
  outfits: Outfit[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getNextOutfitName: () => string;
}

// "코디 1", "코디 2" 등 1~9999 범위의 숫자만 매칭 (timestamp 값 제외)
const OUTFIT_NAME_PATTERN = /^코디\s*(\d{1,4})$/;
const MAX_OUTFIT_INDEX = 9999;

export const useOutfits = (): UseOutfitsReturn => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOutfits = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getOutfits();
      setOutfits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "코디 목록을 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getNextOutfitName = useCallback(() => {
    let maxIndex = 0;

    for (const outfit of outfits) {
      const match = outfit.name.match(OUTFIT_NAME_PATTERN);
      if (match) {
        const index = parseInt(match[1], 10);
        if (index > maxIndex && index <= MAX_OUTFIT_INDEX) {
          maxIndex = index;
        }
      }
    }

    return `코디 ${maxIndex + 1}`;
  }, [outfits]);

  useEffect(() => {
    fetchOutfits();
  }, [fetchOutfits]);

  return {
    outfits,
    isLoading,
    error,
    refetch: fetchOutfits,
    getNextOutfitName,
  };
};

interface UseOutfitDetailReturn {
  outfit: Outfit | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useOutfitDetail = (id: string | null): UseOutfitDetailReturn => {
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOutfit = useCallback(async () => {
    if (!id) {
      setOutfit(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getOutfitById(id);
      setOutfit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "코디를 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOutfit();
  }, [fetchOutfit]);

  return {
    outfit,
    isLoading,
    error,
    refetch: fetchOutfit,
  };
};
