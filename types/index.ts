// 계절 타입
export type Season = "spring" | "summer" | "fall" | "winter";

// 카테고리 타입
export type Category = "top" | "bottom" | "outer" | "accessory" | "shoes" | "bag";

// =============================================
// Database 타입 (Supabase 스키마와 일치)
// =============================================

export interface DbClothes {
  id: string;
  name: string;
  image_urls: string[];
  category: Category;
  seasons: Season[];
  purchase_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbOutfit {
  id: string;
  name: string;
  seasons: Season[];
  created_at: string;
  updated_at: string;
}

export interface DbOutfitItem {
  id: string;
  outfit_id: string;
  clothing_id: string;
  created_at: string;
}

// =============================================
// Client 타입 (컴포넌트에서 사용)
// =============================================

export interface ClothingItem {
  id: string;
  name: string;
  imageUrls: string[];
  category: Category;
  seasons: Season[];
  purchaseLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Outfit {
  id: string;
  name: string;
  items: ClothingItem[];
  seasons: Season[];
  createdAt: string;
  updatedAt: string;
}

// 필터 상태 타입
export interface FilterState {
  seasons: Season[];
  categories: Category[];
}

// =============================================
// 변환 함수
// =============================================

export function toClothingItem(db: DbClothes): ClothingItem {
  return {
    id: db.id,
    name: db.name,
    imageUrls: db.image_urls,
    category: db.category,
    seasons: db.seasons,
    purchaseLink: db.purchase_link ?? undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function toOutfit(db: DbOutfit, items: ClothingItem[]): Outfit {
  return {
    id: db.id,
    name: db.name,
    items,
    seasons: db.seasons,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}
