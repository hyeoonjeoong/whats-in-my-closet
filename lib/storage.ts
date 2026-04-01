import { supabase } from "./supabase";

const BUCKET_NAME = "clothes-images";

interface UploadResult {
  url: string;
  path: string;
}

export const uploadImage = async (file: File): Promise<UploadResult> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = fileName;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`이미지 업로드 실패: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
  };
};

export const deleteImage = async (path: string): Promise<void> => {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    throw new Error(`이미지 삭제 실패: ${error.message}`);
  }
};

export const getImagePathFromUrl = (url: string): string | null => {
  const match = url.match(new RegExp(`${BUCKET_NAME}/(.+)$`));
  return match ? match[1] : null;
};
