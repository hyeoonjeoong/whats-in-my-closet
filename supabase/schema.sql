-- =============================================
-- 내 옷장 (What's in My Closet) 데이터베이스 스키마
-- =============================================

-- 1. clothes 테이블: 옷 아이템
CREATE TABLE clothes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  categories TEXT[] NOT NULL DEFAULT '{}',
  seasons TEXT[] NOT NULL DEFAULT '{}',
  purchase_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. outfits 테이블: 코디 조합
CREATE TABLE outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  seasons TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. outfit_items 테이블: 코디 - 옷 연결 (다대다)
CREATE TABLE outfit_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  clothing_id UUID NOT NULL REFERENCES clothes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(outfit_id, clothing_id)
);

-- 인덱스: 조회 성능 향상
CREATE INDEX idx_clothes_categories ON clothes USING GIN(categories);
CREATE INDEX idx_clothes_seasons ON clothes USING GIN(seasons);
CREATE INDEX idx_outfits_seasons ON outfits USING GIN(seasons);
CREATE INDEX idx_outfit_items_outfit ON outfit_items(outfit_id);
CREATE INDEX idx_outfit_items_clothing ON outfit_items(clothing_id);

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거: clothes 테이블
CREATE TRIGGER clothes_updated_at
  BEFORE UPDATE ON clothes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 트리거: outfits 테이블
CREATE TRIGGER outfits_updated_at
  BEFORE UPDATE ON outfits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- RLS (Row Level Security) 설정
-- 개인 프로젝트이므로 모든 접근 허용
-- =============================================

ALTER TABLE clothes ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

-- 모든 작업 허용 정책
CREATE POLICY "Allow all for clothes" ON clothes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for outfits" ON outfits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for outfit_items" ON outfit_items FOR ALL USING (true) WITH CHECK (true);
