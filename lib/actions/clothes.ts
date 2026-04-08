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

// Next.js 서버 액션에서 FormData 키의 prefix를 제거하는 헬퍼
const getFormValue = (formData: FormData, key: string): FormDataEntryValue | null => {
  // 직접 키로 먼저 시도
  const direct = formData.get(key);
  if (direct !== null) return direct;

  // prefix가 붙은 키 검색 (예: "1_images", "2_data")
  for (const [k, v] of formData.entries()) {
    if (k === key || k.endsWith(`_${key}`)) {
      return v;
    }
  }
  return null;
};

const getFormValues = (formData: FormData, key: string): FormDataEntryValue[] => {
  // 직접 키로 먼저 시도
  const direct = formData.getAll(key);
  if (direct.length > 0) return direct;

  // prefix가 붙은 키 검색
  const values: FormDataEntryValue[] = [];
  for (const [k, v] of formData.entries()) {
    if (k === key || k.endsWith(`_${key}`)) {
      values.push(v);
    }
  }
  return values;
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
    const password = getFormValue(formData, "password") as string;
    if (!verifyPassword(password)) {
      return { success: false, error: "비밀번호가 올바르지 않습니다" };
    }

    const images = getFormValues(formData, "images") as File[];
    const dataJson = getFormValue(formData, "data") as string;
    const data: CreateClothesData = JSON.parse(dataJson);

    if (images.length === 0) {
      return { success: false, error: "이미지를 최소 1장 선택해주세요" };
    }

    if (images.length > 5) {
      return { success: false, error: "이미지는 최대 5장까지 업로드 가능합니다" };
    }

    // 모든 이미지 업로드
    const uploadedFileNames: string[] = [];
    const imageUrls: string[] = [];

    for (const image of images) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        // 실패 시 이미 업로드된 이미지들 삭제
        if (uploadedFileNames.length > 0) {
          await supabase.storage.from(BUCKET_NAME).remove(uploadedFileNames);
        }
        return { success: false, error: `이미지 업로드 실패: ${uploadError.message}` };
      }

      uploadedFileNames.push(fileName);

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

      imageUrls.push(publicUrl);
    }

    // DB 저장
    const { data: dbData, error: dbError } = await supabase
      .from(TABLE_NAME)
      .insert({
        name: data.name,
        image_urls: imageUrls,
        category: data.category,
        seasons: data.seasons,
        purchase_link: data.purchaseLink || null,
      })
      .select()
      .single();

    if (dbError) {
      // 실패 시 업로드된 이미지들 삭제
      await supabase.storage.from(BUCKET_NAME).remove(uploadedFileNames);
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
  existingImageUrls?: string[];
}

export const updateClothesAction = async (
  formData: FormData
): Promise<ActionResult<ClothingItem>> => {
  try {
    const id = getFormValue(formData, "id") as string;
    const password = getFormValue(formData, "password") as string;
    if (!verifyPassword(password)) {
      return { success: false, error: "비밀번호가 올바르지 않습니다" };
    }

    const newImages = getFormValues(formData, "images") as File[];
    const dataJson = getFormValue(formData, "data") as string;
    const data: UpdateClothesData = JSON.parse(dataJson);

    // 기존 이미지 URL 목록 가져오기
    const { data: existing } = await supabase
      .from(TABLE_NAME)
      .select("image_urls")
      .eq("id", id)
      .single();

    const oldImageUrls: string[] = existing?.image_urls || [];
    const existingImageUrls: string[] = data.existingImageUrls || [];

    // 삭제할 이미지 경로 추출
    const deletedImageUrls = oldImageUrls.filter(
      (url) => !existingImageUrls.includes(url)
    );
    const deletedImagePaths: string[] = [];
    for (const url of deletedImageUrls) {
      const match = url.match(new RegExp(`${BUCKET_NAME}/(.+)$`));
      if (match) {
        deletedImagePaths.push(match[1]);
      }
    }

    // 새 이미지 업로드
    const uploadedFileNames: string[] = [];
    const newImageUrls: string[] = [];

    for (const image of newImages) {
      if (image.size === 0) continue;

      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        // 실패 시 이미 업로드된 이미지들 삭제
        if (uploadedFileNames.length > 0) {
          await supabase.storage.from(BUCKET_NAME).remove(uploadedFileNames);
        }
        return { success: false, error: `이미지 업로드 실패: ${uploadError.message}` };
      }

      uploadedFileNames.push(fileName);

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

      newImageUrls.push(publicUrl);
    }

    // 최종 이미지 URL 목록: 유지할 기존 이미지 + 새 이미지
    const finalImageUrls = [...existingImageUrls, ...newImageUrls];

    if (finalImageUrls.length === 0) {
      // 새 이미지 업로드 실패 시 롤백
      if (uploadedFileNames.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(uploadedFileNames);
      }
      return { success: false, error: "이미지가 최소 1장 필요합니다" };
    }

    if (finalImageUrls.length > 5) {
      // 초과 시 롤백
      if (uploadedFileNames.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(uploadedFileNames);
      }
      return { success: false, error: "이미지는 최대 5장까지 등록 가능합니다" };
    }

    // DB 업데이트
    const updateData: Record<string, unknown> = {
      image_urls: finalImageUrls,
    };
    if (data.name !== undefined) updateData.name = data.name;
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
      // 실패 시 새로 업로드한 이미지 삭제
      if (uploadedFileNames.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(uploadedFileNames);
      }
      return { success: false, error: `옷 수정 실패: ${dbError.message}` };
    }

    // 삭제된 이미지 제거
    if (deletedImagePaths.length > 0) {
      await supabase.storage.from(BUCKET_NAME).remove(deletedImagePaths);
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
    const id = getFormValue(formData, "id") as string;
    const password = getFormValue(formData, "password") as string;
    if (!verifyPassword(password)) {
      return { success: false, error: "비밀번호가 올바르지 않습니다" };
    }

    // 기존 이미지 경로들 가져오기
    const { data: existing } = await supabase
      .from(TABLE_NAME)
      .select("image_urls")
      .eq("id", id)
      .single();

    const imagePaths: string[] = [];
    if (existing?.image_urls) {
      for (const url of existing.image_urls) {
        const match = url.match(new RegExp(`${BUCKET_NAME}/(.+)$`));
        if (match) {
          imagePaths.push(match[1]);
        }
      }
    }

    // DB 삭제
    const { error: dbError } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id);

    if (dbError) {
      return { success: false, error: `옷 삭제 실패: ${dbError.message}` };
    }

    // 이미지들 삭제
    if (imagePaths.length > 0) {
      await supabase.storage.from(BUCKET_NAME).remove(imagePaths);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};
