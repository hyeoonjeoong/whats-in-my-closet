import { supabase } from "../supabase";
import { uploadImage, deleteImage, getImagePathFromUrl } from "../storage";
import type { DbClothes, ClothingItem, Category, Season } from "@/types";
import { toClothingItem } from "@/types";

const TABLE_NAME = "clothes";

export interface CreateClothesInput {
  name: string;
  image: File;
  category: Category;
  seasons: Season[];
  purchaseLink?: string;
}

export interface UpdateClothesInput {
  name?: string;
  image?: File;
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
  const { url: imageUrl } = await uploadImage(input.image);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      name: input.name,
      image_url: imageUrl,
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
  let imageUrl: string | undefined;

  if (input.image) {
    const existing = await getClothesById(id);
    const oldPath = getImagePathFromUrl(existing.imageUrl);
    if (oldPath) {
      await deleteImage(oldPath);
    }
    const { url } = await uploadImage(input.image);
    imageUrl = url;
  }

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (imageUrl !== undefined) updateData.image_url = imageUrl;
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
  const imagePath = getImagePathFromUrl(existing.imageUrl);

  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

  if (error) {
    throw new Error(`옷 삭제 실패: ${error.message}`);
  }

  if (imagePath) {
    await deleteImage(imagePath);
  }
};
