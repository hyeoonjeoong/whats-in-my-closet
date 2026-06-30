"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { requireAuth, getServerUser } from "@/lib/auth/serverAuth";
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

// =============================================
// 조회 액션 (유저별 데이터 분리)
// =============================================

export const fetchOutfitsAction = async (): Promise<ActionResult<Outfit[]>> => {
  try {
    const supabase = await createServerSupabaseClient();
    const { user } = await getServerUser();

    // 유저별 코디 조회
    let query = supabase
      .from(OUTFIT_TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (user) {
      // 로그인 유저: 자신의 데이터만
      query = query.eq("user_id", user.id);
    } else {
      // 비로그인: 데모 데이터만 (user_id가 null)
      query = query.is("user_id", null);
    }

    const { data: outfitsData, error: outfitsError } = await query;

    if (outfitsError) {
      return { success: false, error: `코디 목록 조회 실패: ${outfitsError.message}` };
    }

    const outfits = outfitsData as DbOutfit[];

    if (outfits.length === 0) {
      return { success: true, data: [] };
    }

    // 모든 코디의 아이템 연결 정보 조회
    const outfitIds = outfits.map((o) => o.id);
    const { data: outfitItemsData, error: itemsError } = await supabase
      .from(OUTFIT_ITEMS_TABLE)
      .select("*")
      .in("outfit_id", outfitIds);

    if (itemsError) {
      return { success: false, error: `코디 아이템 조회 실패: ${itemsError.message}` };
    }

    const outfitItems = outfitItemsData as { outfit_id: string; clothing_id: string }[];

    // 필요한 옷 아이템 조회
    const clothingIds = [...new Set(outfitItems.map((item) => item.clothing_id))];

    if (clothingIds.length === 0) {
      return { success: true, data: outfits.map((outfit) => toOutfit(outfit, [])) };
    }

    const { data: clothesData, error: clothesError } = await supabase
      .from(CLOTHES_TABLE)
      .select("*")
      .in("id", clothingIds);

    if (clothesError) {
      return { success: false, error: `옷 아이템 조회 실패: ${clothesError.message}` };
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

    return {
      success: true,
      data: outfits.map((outfit) => toOutfit(outfit, outfitItemsMap.get(outfit.id) || [])),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

export const fetchOutfitsByClothingIdAction = async (
  clothingId: string
): Promise<ActionResult<Outfit[]>> => {
  try {
    const supabase = await createServerSupabaseClient();
    const { user } = await getServerUser();

    // 해당 옷이 포함된 outfit_id 조회
    const { data: outfitItemsData, error: itemsError } = await supabase
      .from(OUTFIT_ITEMS_TABLE)
      .select("outfit_id")
      .eq("clothing_id", clothingId);

    if (itemsError) {
      return { success: false, error: `코디 아이템 조회 실패: ${itemsError.message}` };
    }

    if (!outfitItemsData || outfitItemsData.length === 0) {
      return { success: true, data: [] };
    }

    const outfitIds = [...new Set(outfitItemsData.map((item) => item.outfit_id))];

    // 유저별 코디 조회
    let query = supabase
      .from(OUTFIT_TABLE)
      .select("*")
      .in("id", outfitIds)
      .order("created_at", { ascending: false });

    if (user) {
      query = query.eq("user_id", user.id);
    } else {
      query = query.is("user_id", null);
    }

    const { data: outfitsData, error: outfitsError } = await query;

    if (outfitsError) {
      return { success: false, error: `코디 목록 조회 실패: ${outfitsError.message}` };
    }

    const outfits = outfitsData as DbOutfit[];

    if (outfits.length === 0) {
      return { success: true, data: [] };
    }

    // 모든 코디의 아이템 연결 정보 조회
    const filteredOutfitIds = outfits.map((o) => o.id);
    const { data: allOutfitItemsData, error: allItemsError } = await supabase
      .from(OUTFIT_ITEMS_TABLE)
      .select("*")
      .in("outfit_id", filteredOutfitIds);

    if (allItemsError) {
      return { success: false, error: `코디 아이템 조회 실패: ${allItemsError.message}` };
    }

    const outfitItems = allOutfitItemsData as { outfit_id: string; clothing_id: string }[];

    // 필요한 옷 아이템 조회
    const clothingIds = [...new Set(outfitItems.map((item) => item.clothing_id))];

    if (clothingIds.length === 0) {
      return { success: true, data: outfits.map((outfit) => toOutfit(outfit, [])) };
    }

    const { data: clothesData, error: clothesError } = await supabase
      .from(CLOTHES_TABLE)
      .select("*")
      .in("id", clothingIds);

    if (clothesError) {
      return { success: false, error: `옷 아이템 조회 실패: ${clothesError.message}` };
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

    return {
      success: true,
      data: outfits.map((outfit) => toOutfit(outfit, outfitItemsMap.get(outfit.id) || [])),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

export const fetchOutfitDetailAction = async (
  id: string
): Promise<ActionResult<Outfit>> => {
  try {
    const supabase = await createServerSupabaseClient();
    const { user } = await getServerUser();

    // 코디 정보 조회
    const { data: outfitData, error: outfitError } = await supabase
      .from(OUTFIT_TABLE)
      .select("*")
      .eq("id", id)
      .single();

    if (outfitError) {
      return { success: false, error: `코디 조회 실패: ${outfitError.message}` };
    }

    const outfit = outfitData as DbOutfit;

    // 권한 확인: 자신의 데이터이거나 데모 데이터만 조회 가능
    if (outfit.user_id !== null && outfit.user_id !== user?.id) {
      return { success: false, error: "접근 권한이 없습니다" };
    }

    // 코디의 아이템 연결 정보 조회
    const { data: outfitItemsData, error: itemsError } = await supabase
      .from(OUTFIT_ITEMS_TABLE)
      .select("*")
      .eq("outfit_id", id);

    if (itemsError) {
      return { success: false, error: `코디 아이템 조회 실패: ${itemsError.message}` };
    }

    const outfitItems = outfitItemsData as { clothing_id: string }[];

    if (outfitItems.length === 0) {
      return { success: true, data: toOutfit(outfit, []) };
    }

    // 옷 아이템 조회
    const clothingIds = outfitItems.map((item) => item.clothing_id);
    const { data: clothesData, error: clothesError } = await supabase
      .from(CLOTHES_TABLE)
      .select("*")
      .in("id", clothingIds);

    if (clothesError) {
      return { success: false, error: `옷 아이템 조회 실패: ${clothesError.message}` };
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

// =============================================
// 변경 액션 (인증 필요)
// =============================================

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
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const id = getFormValue(formData, "id") as string;
    const dataJson = getFormValue(formData, "data") as string;
    const data: UpdateOutfitData = JSON.parse(dataJson);

    // 기존 데이터 권한 확인
    const { data: existing } = await supabase
      .from(OUTFIT_TABLE)
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return { success: false, error: "수정 권한이 없습니다" };
    }

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
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const id = getFormValue(formData, "id") as string;

    // 기존 데이터 권한 확인
    const { data: existing } = await supabase
      .from(OUTFIT_TABLE)
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return { success: false, error: "삭제 권한이 없습니다" };
    }

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
