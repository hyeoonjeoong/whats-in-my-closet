import type { Season, MainCategory, SubCategory, Style } from "@/types";

// 개별 계절 상수
export const SEASONS: { value: Season; label: string }[] = [
  { value: "spring", label: "봄" },
  { value: "summer", label: "여름" },
  { value: "fall", label: "가을" },
  { value: "winter", label: "겨울" },
  { value: "between", label: "간절기" },
];

// 모든 계절 값 배열
export const ALL_SEASONS: Season[] = SEASONS.map((s) => s.value);

// 스타일 상수
export const STYLES: { value: Style; label: string }[] = [
  { value: "casual", label: "캐주얼" },
  { value: "street", label: "스트릿" },
  { value: "business", label: "비즈니스캐주얼" },
  { value: "lovely", label: "러블리" },
  { value: "vintage", label: "빈티지" },
  { value: "style_etc", label: "기타" },
];

// 최상위 카테고리
export const MAIN_CATEGORIES: { value: MainCategory; label: string }[] = [
  { value: "top", label: "상의" },
  { value: "bottom", label: "하의" },
  { value: "outer", label: "아우터" },
  { value: "accessory", label: "악세사리" },
  { value: "shoes", label: "신발" },
  { value: "bag", label: "가방" },
];

// 카테고리 계층 구조
export const CATEGORY_HIERARCHY: Record<
  MainCategory,
  { value: SubCategory; label: string }[]
> = {
  top: [
    { value: "tshirt", label: "티셔츠" },
    { value: "shirt", label: "셔츠" },
    { value: "blouse", label: "블라우스" },
    { value: "knit", label: "니트" },
    { value: "sweatshirt", label: "맨투맨" },
    { value: "hoodie", label: "후드" },
    { value: "sleeveless", label: "나시" },
    { value: "top_etc", label: "기타" },
  ],
  bottom: [
    { value: "denim", label: "데님" },
    { value: "wide", label: "와이드" },
    { value: "slacks", label: "슬랙스" },
    { value: "long", label: "롱" },
    { value: "shorts", label: "숏" },
    { value: "training", label: "트레이닝" },
    { value: "skirt", label: "스커트" },
  ],
  outer: [
    { value: "cardigan", label: "가디건" },
    { value: "jumper", label: "점퍼" },
    { value: "jacket", label: "재킷" },
    { value: "padding", label: "패딩" },
    { value: "coat", label: "코트" },
    { value: "windbreaker", label: "바람막이" },
    { value: "outer_etc", label: "기타" },
  ],
  accessory: [
    { value: "socks", label: "양말" },
    { value: "belt", label: "벨트" },
    { value: "hat", label: "모자" },
    { value: "scarf", label: "머플러" },
  ],
  shoes: [
    { value: "sneakers", label: "운동화" },
    { value: "boots", label: "부츠/워커" },
    { value: "slippers", label: "슬리퍼" },
  ],
  bag: [
    { value: "shoulder", label: "숄더백" },
    { value: "tote", label: "토트백" },
    { value: "backpack", label: "백팩" },
    { value: "bag_etc", label: "기타" },
  ],
};

// 모든 하위 카테고리 목록 (플랫)
export const ALL_SUB_CATEGORIES: { value: SubCategory; label: string }[] =
  Object.values(CATEGORY_HIERARCHY).flat();

// 하위 카테고리 → 상위 카테고리 매핑
export const SUB_TO_MAIN_CATEGORY: Record<SubCategory, MainCategory> =
  Object.entries(CATEGORY_HIERARCHY).reduce(
    (acc, [main, subs]) => {
      subs.forEach((sub) => {
        acc[sub.value] = main as MainCategory;
      });
      return acc;
    },
    {} as Record<SubCategory, MainCategory>
  );

// 하위 카테고리 라벨 가져오기
export const getSubCategoryLabel = (value: SubCategory): string => {
  const found = ALL_SUB_CATEGORIES.find((c) => c.value === value);
  return found?.label ?? value;
};

// 상위 카테고리 라벨 가져오기
export const getMainCategoryLabel = (value: MainCategory): string => {
  const found = MAIN_CATEGORIES.find((c) => c.value === value);
  return found?.label ?? value;
};

// 상위 카테고리의 모든 하위 카테고리 값 가져오기
export const getSubCategoriesOf = (main: MainCategory): SubCategory[] => {
  return CATEGORY_HIERARCHY[main].map((c) => c.value);
};
