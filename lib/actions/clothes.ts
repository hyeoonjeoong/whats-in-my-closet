"use server";

import { supabase } from "../supabase";
import type { DbClothes, ClothingItem, Category, Season } from "@/types";
import { toClothingItem } from "@/types";

const TABLE_NAME = "clothes";
const BUCKET_NAME = "clothes-images";

const verifyPassword = (password: string): boolean => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("관리자 비밀번호가 설정되지 않았습니다");
  }
  return password === adminPassword;
};

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface CreateClothesData {
  name: string;
  category: Category;
  seasons: Season[];
  purchaseLink?: string;
}

export const createClothesAction = async (
  formData: FormData
): Promise<ActionResult<ClothingItem>> => {
  try {
    const password = formData.get("password") as string;
    if (!verifyPassword(password)) {
      return { success: false, error: "비밀번호가 올바르지 않습니다" };
    }

    const image = formData.get("image") as File;
    const dataJson = formData.get("data") as string;
    const data: CreateClothesData = JSON.parse(dataJson);

    // 이미지 업로드
    const fileExt = image.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, image, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: `이미지 업로드 실패: ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    // DB 저장
    const { data: dbData, error: dbError } = await supabase
      .from(TABLE_NAME)
      .insert({
        name: data.name,
        image_url: publicUrl,
        category: data.category,
        seasons: data.seasons,
        purchase_link: data.purchaseLink || null,
      })
      .select()
      .single();

    if (dbError) {
      // 실패 시 업로드된 이미지 삭제
      await supabase.storage.from(BUCKET_NAME).remove([fileName]);
      return { success: false, error: `옷 추가 실패: ${dbError.message}` };
    }

    return { success: true, data: toClothingItem(dbData as DbClothes) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

interface UpdateClothesData {
  name?: string;
  category?: Category;
  seasons?: Season[];
  purchaseLink?: string | null;
}

export const updateClothesAction = async (
  formData: FormData
): Promise<ActionResult<ClothingItem>> => {
  try {
    const id = formData.get("id") as string;
    const password = formData.get("password") as string;
    if (!verifyPassword(password)) {
      return { success: false, error: "비밀번호가 올바르지 않습니다" };
    }

    const image = formData.get("image") as File | null;
    const dataJson = formData.get("data") as string;
    const data: UpdateClothesData = JSON.parse(dataJson);

    let imageUrl: string | undefined;
    let oldImagePath: string | null = null;

    // 새 이미지가 있으면 업로드
    if (image && image.size > 0) {
      // 기존 이미지 경로 가져오기
      const { data: existing } = await supabase
        .from(TABLE_NAME)
        .select("image_url")
        .eq("id", id)
        .single();

      if (existing?.image_url) {
        const match = existing.image_url.match(new RegExp(`${BUCKET_NAME}/(.+)$`));
        oldImagePath = match ? match[1] : null;
      }

      // 새 이미지 업로드
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        return { success: false, error: `이미지 업로드 실패: ${uploadError.message}` };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

      imageUrl = publicUrl;
    }

    // DB 업데이트
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.seasons !== undefined) updateData.seasons = data.seasons;
    if (data.purchaseLink !== undefined) updateData.purchase_link = data.purchaseLink;

    const { data: dbData, error: dbError } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (dbError) {
      return { success: false, error: `옷 수정 실패: ${dbError.message}` };
    }

    // 이전 이미지 삭제
    if (oldImagePath && imageUrl) {
      await supabase.storage.from(BUCKET_NAME).remove([oldImagePath]);
    }

    return { success: true, data: toClothingItem(dbData as DbClothes) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

export const deleteClothesAction = async (
  formData: FormData
): Promise<ActionResult<void>> => {
  try {
    const id = formData.get("id") as string;
    const password = formData.get("password") as string;
    if (!verifyPassword(password)) {
      return { success: false, error: "비밀번호가 올바르지 않습니다" };
    }

    // 기존 이미지 경로 가져오기
    const { data: existing } = await supabase
      .from(TABLE_NAME)
      .select("image_url")
      .eq("id", id)
      .single();

    let imagePath: string | null = null;
    if (existing?.image_url) {
      const match = existing.image_url.match(new RegExp(`${BUCKET_NAME}/(.+)$`));
      imagePath = match ? match[1] : null;
    }

    // DB 삭제
    const { error: dbError } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id);

    if (dbError) {
      return { success: false, error: `옷 삭제 실패: ${dbError.message}` };
    }

    // 이미지 삭제
    if (imagePath) {
      await supabase.storage.from(BUCKET_NAME).remove([imagePath]);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};
