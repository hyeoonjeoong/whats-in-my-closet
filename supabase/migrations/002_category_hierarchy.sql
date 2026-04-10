-- =============================================
-- 카테고리 계층 구조 마이그레이션
-- category (단일) → categories (배열)
-- =============================================

-- 1. 새 컬럼 추가
ALTER TABLE clothes ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';

-- 2. 기존 category 값을 categories 배열로 마이그레이션
-- 기존 최상위 카테고리를 첫 번째 하위 카테고리로 매핑
UPDATE clothes SET categories =
  CASE category
    WHEN 'top' THEN ARRAY['tshirt']::TEXT[]
    WHEN 'bottom' THEN ARRAY['denim']::TEXT[]
    WHEN 'outer' THEN ARRAY['jacket']::TEXT[]
    WHEN 'accessory' THEN ARRAY['hat']::TEXT[]
    WHEN 'shoes' THEN ARRAY['sneakers']::TEXT[]
    WHEN 'bag' THEN ARRAY['shoulder']::TEXT[]
    ELSE ARRAY[]::TEXT[]
  END
WHERE categories = '{}' OR categories IS NULL;

-- 3. GIN 인덱스 추가 (배열 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_clothes_categories ON clothes USING GIN(categories);

-- 참고: 기존 category 컬럼은 삭제하지 않음 (롤백 가능하도록)
-- 운영에서 안정화 후 수동으로 삭제: ALTER TABLE clothes DROP COLUMN category;

-- =============================================
-- 계절 타입 확장
-- 기존: spring, summer, fall, winter
-- 추가: all (무관), between (간절기)
-- =============================================

-- seasons 배열에 새 값들이 들어갈 수 있도록 CHECK 제약 조건 변경 없음
-- (TEXT[] 타입이라 제약 조건이 없음)

-- 기존 seasons 데이터 확인 쿼리 (필요시 실행)
-- SELECT DISTINCT unnest(seasons) FROM clothes;
-- SELECT DISTINCT unnest(seasons) FROM outfits;
