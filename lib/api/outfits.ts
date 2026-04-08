import { supabase } from "../supabase";
import type { DbOutfit, DbOutfitItem, DbClothes, Outfit, ClothingItem } from "@/types";
import { toClothingItem, toOutfit } from "@/types";

const OUTFIT_TABLE = "outfits";
const OUTFIT_ITEMS_TABLE = "outfit_items";
const CLOTHES_TABLE = "clothes";

export const getOutfits = async (): Promise<Outfit[]> => {
  // 모든 코디 조회
  const { data: outfitsData, error: outfitsError } = await supabase
    .from(OUTFIT_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (outfitsError) {
    throw new Error(`코디 목록 조회 실패: ${outfitsError.message}`);
  }

  const outfits = outfitsData as DbOutfit[];

  if (outfits.length === 0) {
    return [];
  }

  // 모든 코디의 아이템 연결 정보 조회
  const outfitIds = outfits.map((o) => o.id);
  const { data: outfitItemsData, error: itemsError } = await supabase
    .from(OUTFIT_ITEMS_TABLE)
    .select("*")
    .in("outfit_id", outfitIds);

  if (itemsError) {
    throw new Error(`코디 아이템 조회 실패: ${itemsError.message}`);
  }

  const outfitItems = outfitItemsData as DbOutfitItem[];

  // 필요한 옷 아이템 조회
  const clothingIds = [...new Set(outfitItems.map((item) => item.clothing_id))];

  if (clothingIds.length === 0) {
    return outfits.map((outfit) => toOutfit(outfit, []));
  }

  const { data: clothesData, error: clothesError } = await supabase
    .from(CLOTHES_TABLE)
    .select("*")
    .in("id", clothingIds);

  if (clothesError) {
    throw new Error(`옷 아이템 조회 실패: ${clothesError.message}`);
  }

  const clothesMap = new Map<string, ClothingItem>(
    (clothesData as DbClothes[]).map((c) => [c.id, toClothingItem(c)])
  );

  // 코디별로 아이템 그룹핑
  const outfitItemsMap = new Map<string, ClothingItem[]>();
  for (const item of outfitItems) {
    const clothing = clothesMap.get(item.clothing_id);
    if (clothing) {
      const items = outfitItemsMap.get(item.outfit_id) || [];
      items.push(clothing);
      outfitItemsMap.set(item.outfit_id, items);
    }
  }

  return outfits.map((outfit) => toOutfit(outfit, outfitItemsMap.get(outfit.id) || []));
};

export const getOutfitById = async (id: string): Promise<Outfit> => {
  // 코디 정보 조회
  const { data: outfitData, error: outfitError } = await supabase
    .from(OUTFIT_TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (outfitError) {
    throw new Error(`코디 조회 실패: ${outfitError.message}`);
  }

  const outfit = outfitData as DbOutfit;

  // 코디의 아이템 연결 정보 조회
  const { data: outfitItemsData, error: itemsError } = await supabase
    .from(OUTFIT_ITEMS_TABLE)
    .select("*")
    .eq("outfit_id", id);

  if (itemsError) {
    throw new Error(`코디 아이템 조회 실패: ${itemsError.message}`);
  }

  const outfitItems = outfitItemsData as DbOutfitItem[];

  if (outfitItems.length === 0) {
    return toOutfit(outfit, []);
  }

  // 옷 아이템 조회
  const clothingIds = outfitItems.map((item) => item.clothing_id);
  const { data: clothesData, error: clothesError } = await supabase
    .from(CLOTHES_TABLE)
    .select("*")
    .in("id", clothingIds);

  if (clothesError) {
    throw new Error(`옷 아이템 조회 실패: ${clothesError.message}`);
  }

  const items = (clothesData as DbClothes[]).map(toClothingItem);

  return toOutfit(outfit, items);
};
