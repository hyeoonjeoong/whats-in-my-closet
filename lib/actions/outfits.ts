"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth/serverAuth";
import type { DbOutfit, DbClothes, Outfit, Season, Style, Mood, ClothingItem } from "@/types";
import { toClothingItem, toOutfit } from "@/types";

const OUTFIT_TABLE = "outfits";
const OUTFIT_ITEMS_TABLE = "outfit_items";
const CLOTHES_TABLE = "clothes";

const getFormValue = (formData: FormData, key: string): FormDataEntryValue | null => {
  const direct = formData.get(key);
  if (direct !== null) return direct;

  for (const [k, v] of formData.entries()) {
    if (k === key || k.endsWith(`_${key}`)) {
      return v;
    }
  }
  return null;
};

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface CreateOutfitData {
  name: string;
  seasons: Season[];
  styles: Style[];
  moods: Mood[];
  clothingIds: string[];
}

export const createOutfitAction = async (
  formData: FormData
): Promise<ActionResult<Outfit>> => {
  try {
    // 인증 확인
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const dataJson = getFormValue(formData, "data") as string;
    const data: CreateOutfitData = JSON.parse(dataJson);

    if (data.clothingIds.length === 0) {
      return { success: false, error: "옷을 최소 1개 선택해주세요" };
    }

    // 코디 생성 (user_id 포함)
    const { data: outfitData, error: outfitError } = await supabase
      .from(OUTFIT_TABLE)
      .insert({
        name: data.name,
        seasons: data.seasons,
        styles: data.styles,
        moods: data.moods,
        user_id: user.id,
      })
      .select()
      .single();

    if (outfitError) {
      return { success: false, error: `코디 생성 실패: ${outfitError.message}` };
    }

    const outfit = outfitData as DbOutfit;

    // 코디-옷 연결 생성
    const outfitItems = data.clothingIds.map((clothingId) => ({
      outfit_id: outfit.id,
      clothing_id: clothingId,
    }));

    const { error: itemsError } = await supabase
      .from(OUTFIT_ITEMS_TABLE)
      .insert(outfitItems);

    if (itemsError) {
      // 롤백: 생성된 코디 삭제
      await supabase.from(OUTFIT_TABLE).delete().eq("id", outfit.id);
      return { success: false, error: `코디 아이템 연결 실패: ${itemsError.message}` };
    }

    // 연결된 옷 정보 조회
    const { data: clothesData, error: clothesError } = await supabase
      .from(CLOTHES_TABLE)
      .select("*")
      .in("id", data.clothingIds);

    if (clothesError) {
      return { success: false, error: `옷 정보 조회 실패: ${clothesError.message}` };
    }

    const items = (clothesData as DbClothes[]).map(toClothingItem);

    return { success: true, data: toOutfit(outfit, items) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

interface UpdateOutfitData {
  name?: string;
  seasons?: Season[];
  styles?: Style[];
  moods?: Mood[];
  clothingIds?: string[];
}

export const updateOutfitAction = async (
  formData: FormData
): Promise<ActionResult<Outfit>> => {
  try {
    // 인증 확인
    await requireAuth();
    const supabase = await createServerSupabaseClient();

    const id = getFormValue(formData, "id") as string;
    const dataJson = getFormValue(formData, "data") as string;
    const data: UpdateOutfitData = JSON.parse(dataJson);

    // 코디 정보 업데이트
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.seasons !== undefined) updateData.seasons = data.seasons;
    if (data.styles !== undefined) updateData.styles = data.styles;
    if (data.moods !== undefined) updateData.moods = data.moods;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from(OUTFIT_TABLE)
        .update(updateData)
        .eq("id", id);

      if (updateError) {
        return { success: false, error: `코디 수정 실패: ${updateError.message}` };
      }
    }

    // 옷 연결 업데이트
    if (data.clothingIds !== undefined) {
      if (data.clothingIds.length === 0) {
        return { success: false, error: "옷을 최소 1개 선택해주세요" };
      }

      // 기존 연결 삭제
      const { error: deleteError } = await supabase
        .from(OUTFIT_ITEMS_TABLE)
        .delete()
        .eq("outfit_id", id);

      if (deleteError) {
        return { success: false, error: `기존 연결 삭제 실패: ${deleteError.message}` };
      }

      // 새 연결 생성
      const outfitItems = data.clothingIds.map((clothingId) => ({
        outfit_id: id,
        clothing_id: clothingId,
      }));

      const { error: insertError } = await supabase
        .from(OUTFIT_ITEMS_TABLE)
        .insert(outfitItems);

      if (insertError) {
        return { success: false, error: `옷 연결 실패: ${insertError.message}` };
      }
    }

    // 업데이트된 코디 조회
    const { data: outfitData, error: outfitError } = await supabase
      .from(OUTFIT_TABLE)
      .select("*")
      .eq("id", id)
      .single();

    if (outfitError) {
      return { success: false, error: `코디 조회 실패: ${outfitError.message}` };
    }

    // 연결된 옷 조회
    const { data: itemsData } = await supabase
      .from(OUTFIT_ITEMS_TABLE)
      .select("clothing_id")
      .eq("outfit_id", id);

    const clothingIds = (itemsData || []).map((item: { clothing_id: string }) => item.clothing_id);

    let items: ClothingItem[] = [];
    if (clothingIds.length > 0) {
      const { data: clothesData } = await supabase
        .from(CLOTHES_TABLE)
        .select("*")
        .in("id", clothingIds);

      items = (clothesData as DbClothes[] || []).map(toClothingItem);
    }

    return { success: true, data: toOutfit(outfitData as DbOutfit, items) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

export const deleteOutfitAction = async (
  formData: FormData
): Promise<ActionResult<void>> => {
  try {
    // 인증 확인
    await requireAuth();
    const supabase = await createServerSupabaseClient();

    const id = getFormValue(formData, "id") as string;

    // 코디 삭제 (cascade로 outfit_items도 자동 삭제됨)
    const { error: deleteError } = await supabase
      .from(OUTFIT_TABLE)
      .delete()
      .eq("id", id);

    if (deleteError) {
      return { success: false, error: `코디 삭제 실패: ${deleteError.message}` };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};
