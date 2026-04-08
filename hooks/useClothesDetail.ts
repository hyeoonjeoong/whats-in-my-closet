"use client";

import { useState, useCallback } from "react";
import { getClothesById } from "@/lib/api/clothes";
import {
  updateClothesAction,
  deleteClothesAction,
} from "@/lib/actions/clothes";
import type { Category, Season, ClothingItem } from "@/types";

interface FormData {
  imageUrls: string[];
  newImages: File[];
  name: string;
  category: Category | null;
  seasons: Season[];
  purchaseLink: string;
}

interface FormErrors {
  name?: string;
  category?: string;
  seasons?: string;
  purchaseLink?: string;
  password?: string;
}

interface UseClothesDetailReturn {
  item: ClothingItem | null;
  formData: FormData;
  errors: FormErrors;
  isLoading: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  isEditing: boolean;
  loadItem: (id: string) => Promise<void>;
  startEditing: () => void;
  cancelEditing: () => void;
  setImageUrls: (urls: string[]) => void;
  setNewImages: (files: File[]) => void;
  setName: (name: string) => void;
  setCategory: (category: Category) => void;
  setSeasons: (seasons: Season[]) => void;
  setPurchaseLink: (link: string) => void;
  submitEdit: (password: string) => Promise<ClothingItem>;
  deleteItem: (password: string) => Promise<void>;
  reset: () => void;
  clearPasswordError: () => void;
}

const initialFormData: FormData = {
  imageUrls: [],
  newImages: [],
  name: "",
  category: null,
  seasons: [],
  purchaseLink: "",
};

const URL_PATTERN =
  /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

export const useClothesDetail = (): UseClothesDetailReturn => {
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const loadItem = useCallback(async (id: string) => {
    setIsLoading(true);
    setIsEditing(false);
    setErrors({});

    try {
      const loadedItem = await getClothesById(id);
      setItem(loadedItem);
      setFormData({
        imageUrls: loadedItem.imageUrls,
        newImages: [],
        name: loadedItem.name,
        category: loadedItem.category,
        seasons: loadedItem.seasons,
        purchaseLink: loadedItem.purchaseLink ?? "",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const cancelEditing = useCallback(() => {
    if (item) {
      setFormData({
        imageUrls: item.imageUrls,
        newImages: [],
        name: item.name,
        category: item.category,
        seasons: item.seasons,
        purchaseLink: item.purchaseLink ?? "",
      });
    }
    setErrors({});
    setIsEditing(false);
  }, [item]);

  const setImageUrls = useCallback((urls: string[]) => {
    setFormData((prev) => ({ ...prev, imageUrls: urls }));
  }, []);

  const setNewImages = useCallback((files: File[]) => {
    setFormData((prev) => ({ ...prev, newImages: files }));
  }, []);

  const setName = useCallback((name: string) => {
    setFormData((prev) => ({ ...prev, name }));
    setErrors((prev) => ({ ...prev, name: undefined }));
  }, []);

  const setCategory = useCallback((category: Category) => {
    setFormData((prev) => ({ ...prev, category }));
    setErrors((prev) => ({ ...prev, category: undefined }));
  }, []);

  const setSeasons = useCallback((seasons: Season[]) => {
    setFormData((prev) => ({ ...prev, seasons }));
    setErrors((prev) => ({ ...prev, seasons: undefined }));
  }, []);

  const setPurchaseLink = useCallback((purchaseLink: string) => {
    setFormData((prev) => ({ ...prev, purchaseLink }));
    setErrors((prev) => ({ ...prev, purchaseLink: undefined }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요";
    } else if (formData.name.length > 50) {
      newErrors.name = "이름은 50자 이하로 입력해주세요";
    }

    if (!formData.category) {
      newErrors.category = "카테고리를 선택해주세요";
    }

    if (formData.seasons.length === 0) {
      newErrors.seasons = "계절을 최소 1개 선택해주세요";
    }

    if (formData.purchaseLink && !URL_PATTERN.test(formData.purchaseLink)) {
      newErrors.purchaseLink = "올바른 URL 형식이 아닙니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const submitEdit = useCallback(
    async (password: string): Promise<ClothingItem> => {
      if (!item) {
        throw new Error("아이템이 로드되지 않았습니다");
      }

      if (!validate()) {
        throw new Error("입력값을 확인해주세요");
      }

      if (!formData.category) {
        throw new Error("카테고리를 선택해주세요");
      }

      // 최소 1장의 이미지 필요 (기존 이미지 + 새 이미지)
      if (formData.imageUrls.length === 0 && formData.newImages.length === 0) {
        throw new Error("이미지가 최소 1장 필요합니다");
      }

      setIsSubmitting(true);
      setErrors((prev) => ({ ...prev, password: undefined }));

      try {
        const submitFormData = new FormData();
        submitFormData.append("id", item.id);
        formData.newImages.forEach((image) => {
          submitFormData.append("images", image);
        });
        submitFormData.append(
          "data",
          JSON.stringify({
            name: formData.name.trim(),
            category: formData.category,
            seasons: formData.seasons,
            purchaseLink: formData.purchaseLink.trim() || null,
            existingImageUrls: formData.imageUrls,
          })
        );
        submitFormData.append("password", password);

        const result = await updateClothesAction(submitFormData);

        if (!result.success) {
          setErrors((prev) => ({ ...prev, password: result.error }));
          throw new Error(result.error);
        }

        const updatedItem = result.data!;
        setItem(updatedItem);
        setFormData({
          imageUrls: updatedItem.imageUrls,
          newImages: [],
          name: updatedItem.name,
          category: updatedItem.category,
          seasons: updatedItem.seasons,
          purchaseLink: updatedItem.purchaseLink ?? "",
        });
        setIsEditing(false);

        return updatedItem;
      } finally {
        setIsSubmitting(false);
      }
    },
    [item, formData, validate]
  );

  const deleteItem = useCallback(
    async (password: string): Promise<void> => {
      if (!item) {
        throw new Error("아이템이 로드되지 않았습니다");
      }

      setIsDeleting(true);
      setErrors((prev) => ({ ...prev, password: undefined }));

      try {
        const deleteFormData = new FormData();
        deleteFormData.append("id", item.id);
        deleteFormData.append("password", password);

        const result = await deleteClothesAction(deleteFormData);

        if (!result.success) {
          setErrors((prev) => ({ ...prev, password: result.error }));
          throw new Error(result.error);
        }
      } finally {
        setIsDeleting(false);
      }
    },
    [item]
  );

  const reset = useCallback(() => {
    setItem(null);
    setFormData(initialFormData);
    setErrors({});
    setIsEditing(false);
    setIsLoading(false);
    setIsSubmitting(false);
    setIsDeleting(false);
  }, []);

  const clearPasswordError = useCallback(() => {
    setErrors((prev) => ({ ...prev, password: undefined }));
  }, []);

  return {
    item,
    formData,
    errors,
    isLoading,
    isSubmitting,
    isDeleting,
    isEditing,
    loadItem,
    startEditing,
    cancelEditing,
    setImageUrls,
    setNewImages,
    setName,
    setCategory,
    setSeasons,
    setPurchaseLink,
    submitEdit,
    deleteItem,
    reset,
    clearPasswordError,
  };
};
