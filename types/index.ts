// 계절 타입 (실제 저장되는 값)
export type Season = "spring" | "summer" | "fall" | "winter";

// 스타일 타입
export type Style = "casual" | "street" | "business" | "lovely" | "vintage" | "style_etc";

// 무드 타입
export type Mood = "clean" | "hip" | "overfit" | "layered" | "monotone" | "daily" | "date";

// 최상위 카테고리 타입
export type MainCategory =
  | "top"
  | "bottom"
  | "outer"
  | "accessory"
  | "shoes"
  | "bag";

// 하위 카테고리 타입
export type SubCategory =
  // 상의
  | "tshirt"
  | "shirt"
  | "blouse"
  | "knit"
  | "sweatshirt"
  | "hoodie"
  | "sleeveless"
  | "top_etc"
  // 하의
  | "denim"
  | "wide"
  | "slacks"
  | "long"
  | "shorts"
  | "training"
  | "skirt"
  // 아우터
  | "cardigan"
  | "jumper"
  | "jacket"
  | "padding"
  | "coat"
  | "windbreaker"
  | "outer_etc"
  // 악세사리
  | "socks"
  | "belt"
  | "hat"
  | "scarf"
  // 신발
  | "sneakers"
  | "boots"
  | "slippers"
  // 가방
  | "shoulder"
  | "tote"
  | "backpack"
  | "bag_etc";

// 카테고리 타입 (하위 카테고리 배열로 저장)
export type Category = SubCategory;

// =============================================
// Database 타입 (Supabase 스키마와 일치)
// =============================================

export interface DbClothes {
  id: string;
  name: string;
  image_urls: string[];
  // 새 구조: categories 배열
  categories?: Category[];
  // 기존 구조: category 단일 값 (마이그레이션 전 호환)
  category?: MainCategory;
  seasons: Season[];
  purchase_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbOutfit {
  id: string;
  name: string;
  seasons: Season[];
  styles?: Style[];
  moods?: Mood[];
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
  categories: Category[];
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
  styles: Style[];
  moods: Mood[];
  createdAt: string;
  updatedAt: string;
}

// 필터 상태 타입
export interface FilterState {
  seasons: Season[];
  categories: SubCategory[];
}

// =============================================
// 변환 함수
// =============================================

// 기존 category를 새 categories로 변환하는 매핑
const LEGACY_CATEGORY_MAP: Record<MainCategory, SubCategory> = {
  top: "tshirt",
  bottom: "denim",
  outer: "jacket",
  accessory: "hat",
  shoes: "sneakers",
  bag: "shoulder",
};

export function toClothingItem(db: DbClothes): ClothingItem {
  // categories가 있으면 사용, 없으면 기존 category를 변환
  let categories: Category[];
  if (db.categories && db.categories.length > 0) {
    categories = db.categories;
  } else if (db.category) {
    // 기존 category를 기본 하위 카테고리로 매핑
    categories = [LEGACY_CATEGORY_MAP[db.category]];
  } else {
    categories = [];
  }

  return {
    id: db.id,
    name: db.name,
    imageUrls: db.image_urls,
    categories,
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
    styles: db.styles || [],
    moods: db.moods || [],
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}
