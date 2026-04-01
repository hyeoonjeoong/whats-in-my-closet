-- =============================================
-- Storage 버킷 설정
-- Supabase Dashboard > Storage 에서 실행
-- =============================================

-- 1. 'clothes' 버킷 생성 (이미지 저장용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('clothes', 'clothes', true);

-- 2. 공개 접근 정책 (이미지 조회)
CREATE POLICY "Public read access for clothes"
ON storage.objects FOR SELECT
USING (bucket_id = 'clothes');

-- 3. 업로드 허용 정책
CREATE POLICY "Allow upload to clothes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'clothes');

-- 4. 삭제 허용 정책
CREATE POLICY "Allow delete from clothes"
ON storage.objects FOR DELETE
USING (bucket_id = 'clothes');
