-- =============================================
-- 다중 이미지 지원 마이그레이션
-- image_url (단일) → image_urls (배열)
-- =============================================

-- 1. 새 컬럼 추가
ALTER TABLE clothes ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- 2. 기존 단일 이미지를 배열로 마이그레이션
UPDATE clothes
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);

-- 3. 기존 컬럼 삭제 (마이그레이션 완료 후 수동 실행 권장)
-- ALTER TABLE clothes DROP COLUMN IF EXISTS image_url;

-- 참고: 롤백이 필요한 경우
-- ALTER TABLE clothes ADD COLUMN IF NOT EXISTS image_url TEXT;
-- UPDATE clothes SET image_url = image_urls[1] WHERE array_length(image_urls, 1) > 0;
