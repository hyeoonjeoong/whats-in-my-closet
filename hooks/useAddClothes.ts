"use client";

import { useState, useCallback } from "react";
import { createClothesAction } from "@/lib/actions/clothes";
import type { Category, Season, ClothingItem } from "@/types";

interface FormData {
  image: File | null;
  name: string;
  category: Category | null;
  seasons: Season[];
  purchaseLink: string;
}

interface FormErrors {
  image?: string;
  name?: string;
  category?: string;
  seasons?: string;
  purchaseLink?: string;
  password?: string;
}

interface UseAddClothesReturn {
  formData: FormData;
  errors: FormErrors;
  isSubmitting: boolean;
  setImage: (file: File | null) => void;
  setName: (name: string) => void;
  setCategory: (category: Category) => void;
  setSeasons: (seasons: Season[]) => void;
  setPurchaseLink: (link: string) => void;
  validate: () => boolean;
  submit: (password: string) => Promise<ClothingItem>;
  reset: () => void;
  clearPasswordError: () => void;
}

const initialFormData: FormData = {
  image: null,
  name: "",
  category: null,
  seasons: [],
  purchaseLink: "",
};

const URL_PATTERN = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

export const useAddClothes = (): UseAddClothesReturn => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setImage = useCallback((file: File | null) => {
    setFormData((prev) => ({ ...prev, image: file }));
    setErrors((prev) => ({ ...prev, image: undefined }));
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

    if (!formData.image) {
      newErrors.image = "이미지를 선택해주세요";
    }

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

  const submit = useCallback(async (password: string): Promise<ClothingItem> => {
    if (!validate()) {
      throw new Error("입력값을 확인해주세요");
    }

    if (!formData.image || !formData.category) {
      throw new Error("필수 항목을 입력해주세요");
    }

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, password: undefined }));

    try {
      const submitFormData = new FormData();
      submitFormData.append("image", formData.image);
      submitFormData.append(
        "data",
        JSON.stringify({
          name: formData.name.trim(),
          category: formData.category,
          seasons: formData.seasons,
          purchaseLink: formData.purchaseLink.trim() || undefined,
        })
      );
      submitFormData.append("password", password);

      const result = await createClothesAction(submitFormData);

      if (!result.success) {
        setErrors((prev) => ({ ...prev, password: result.error }));
        throw new Error(result.error);
      }

      return result.data!;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validate]);

  const reset = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, []);

  const clearPasswordError = useCallback(() => {
    setErrors((prev) => ({ ...prev, password: undefined }));
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    setImage,
    setName,
    setCategory,
    setSeasons,
    setPurchaseLink,
    validate,
    submit,
    reset,
    clearPasswordError,
  };
};
