import { supabase } from "../supabase";
import { uploadImage, deleteImage, getImagePathFromUrl } from "../storage";
import type { DbClothes, ClothingItem, Category, Season } from "@/types";
import { toClothingItem } from "@/types";

const TABLE_NAME = "clothes";

export interface CreateClothesInput {
  name: string;
  images: File[];
  category: Category;
  seasons: Season[];
  purchaseLink?: string;
}

export interface UpdateClothesInput {
  name?: string;
  newImages?: File[];
  existingImageUrls?: string[];
  category?: Category;
  seasons?: Season[];
  purchaseLink?: string | null;
}

export const getClothes = async (): Promise<ClothingItem[]> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`옷 목록 조회 실패: ${error.message}`);
  }

  return (data as DbClothes[]).map(toClothingItem);
};

export const getClothesById = async (id: string): Promise<ClothingItem> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`옷 조회 실패: ${error.message}`);
  }

  return toClothingItem(data as DbClothes);
};

export const createClothes = async (
  input: CreateClothesInput
): Promise<ClothingItem> => {
  const imageUrls: string[] = [];

  for (const image of input.images) {
    const { url } = await uploadImage(image);
    imageUrls.push(url);
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      name: input.name,
      image_urls: imageUrls,
      category: input.category,
      seasons: input.seasons,
      purchase_link: input.purchaseLink || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`옷 추가 실패: ${error.message}`);
  }

  return toClothingItem(data as DbClothes);
};

export const updateClothes = async (
  id: string,
  input: UpdateClothesInput
): Promise<ClothingItem> => {
  const existing = await getClothesById(id);

  // 삭제할 이미지 처리
  const existingUrls = input.existingImageUrls || [];
  const deletedUrls = existing.imageUrls.filter(
    (url) => !existingUrls.includes(url)
  );

  for (const url of deletedUrls) {
    const path = getImagePathFromUrl(url);
    if (path) {
      await deleteImage(path);
    }
  }

  // 새 이미지 업로드
  const newImageUrls: string[] = [];
  if (input.newImages) {
    for (const image of input.newImages) {
      const { url } = await uploadImage(image);
      newImageUrls.push(url);
    }
  }

  const finalImageUrls = [...existingUrls, ...newImageUrls];

  const updateData: Record<string, unknown> = {
    image_urls: finalImageUrls,
  };
  if (input.name !== undefined) updateData.name = input.name;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.seasons !== undefined) updateData.seasons = input.seasons;
  if (input.purchaseLink !== undefined)
    updateData.purchase_link = input.purchaseLink;

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`옷 수정 실패: ${error.message}`);
  }

  return toClothingItem(data as DbClothes);
};

export const deleteClothes = async (id: string): Promise<void> => {
  const existing = await getClothesById(id);

  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

  if (error) {
    throw new Error(`옷 삭제 실패: ${error.message}`);
  }

  // 모든 이미지 삭제
  for (const url of existing.imageUrls) {
    const imagePath = getImagePathFromUrl(url);
    if (imagePath) {
      await deleteImage(imagePath);
    }
  }
};
