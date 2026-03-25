// 계절 타입
export type Season = "spring" | "summer" | "fall" | "winter";

// 카테고리 타입
export type Category = "top" | "bottom" | "outer" | "accessory" | "shoes" | "bag";

// 옷 아이템 타입
export interface ClothingItem {
  id: string;
  name: string;
  imageUrl: string;
  category: Category;
  seasons: Season[];
  purchaseLink?: string;
  createdAt: string;
  updatedAt: string;
}

// 코디 조합 타입
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
