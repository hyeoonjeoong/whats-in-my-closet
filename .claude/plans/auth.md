# 인증 및 데모 모드 구현 계획

## 개요
카카오 OAuth 로그인을 추가하고, 비로그인 시 데모 데이터 조회, 로그인 시 본인 데이터 CRUD 가능하도록 구현

## 사용자 선택
- **데모 데이터**: 기존 등록된 데이터를 데모로 사용 (user_id = NULL)
- **마이페이지**: 로그아웃 기능만 (선호 사이즈 등은 추후 추가)
- **로그인 버튼**: 기존 디자인 시스템의 일반 텍스트 버튼

## 주요 변경사항
- Supabase Auth (카카오 OAuth) 연동
- 비밀번호 입력 방식 → 세션 인증으로 전환
- user_id 기반 데이터 분리
- 헤더에 로그인/프로필 버튼 추가
- 데모 모드 안내 UI 추가

---

## 진행 현황

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 1 | Supabase + Kakao 설정 | ✅ 완료 |
| Phase 2 | DB 마이그레이션 (user_id, RLS) | ✅ 완료 |
| Phase 3-1 | Auth 시스템 구축 | ✅ 완료 |
| Phase 3-2 | Server Actions 수정 | ✅ 완료 |
| Phase 3-3 | Hooks 수정 | ✅ 완료 |
| Phase 3-4 | UI 컴포넌트 수정 (Header) | ✅ 완료 |
| Phase 3-5 | 데모 모드 UI | ✅ 완료 |
| Phase 3-6 | 데모 모드 권한 체크 | ✅ 완료 |
| Phase 3-7 | 마이페이지 | ⬜ 미진행 (추후) |
| Phase 3-8 | PasswordModal 제거 | ✅ 완료 |
| Phase 4 | 타입 수정 | ✅ 완료 |
| Phase 5 | 환경 변수 정리 | ✅ 완료 |

---

## Phase 1: Supabase 설정 (외부 작업) ✅

### 1-1. Kakao Developers 설정
- 애플리케이션 등록
- REST API 키 발급
- Redirect URI 등록: `https://kypyoyyyzbkzmwenggbl.supabase.co/auth/v1/callback`

### 1-2. Supabase Dashboard 설정
- Authentication > Providers > Kakao 활성화
- Kakao Client ID, Client Secret 입력

---

## Phase 2: DB 마이그레이션

### 2-1. 스키마 변경 SQL
```sql
-- 1. user_id 컬럼 추가 (nullable로 먼저)
ALTER TABLE clothes ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE outfits ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. 기존 데이터를 데모 데이터로 표시 (user_id = NULL 유지)
-- 데모 데이터는 user_id가 NULL인 데이터로 처리

-- 3. RLS 정책 변경
DROP POLICY IF EXISTS "Allow all access to clothes" ON clothes;
DROP POLICY IF EXISTS "Allow all access to outfits" ON outfits;
DROP POLICY IF EXISTS "Allow all access to outfit_items" ON outfit_items;

-- clothes: 조회는 본인 + 데모(NULL), 쓰기는 본인만
CREATE POLICY "Select own and demo clothes" ON clothes
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Insert own clothes" ON clothes
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Update own clothes" ON clothes
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Delete own clothes" ON clothes
  FOR DELETE USING (user_id = auth.uid());

-- outfits: 동일하게 적용
CREATE POLICY "Select own and demo outfits" ON outfits
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Insert own outfits" ON outfits
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Update own outfits" ON outfits
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Delete own outfits" ON outfits
  FOR DELETE USING (user_id = auth.uid());

-- outfit_items: outfits와 연동
CREATE POLICY "Select outfit_items for accessible outfits" ON outfit_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id
            AND (outfits.user_id = auth.uid() OR outfits.user_id IS NULL))
  );
CREATE POLICY "Insert outfit_items for own outfits" ON outfit_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id
            AND outfits.user_id = auth.uid())
  );
CREATE POLICY "Delete outfit_items for own outfits" ON outfit_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id
            AND outfits.user_id = auth.uid())
  );
```

---

## Phase 3: 코드 구현

### 3-1. Auth 시스템 구축 ✅
**새 파일:**
- `lib/auth/AuthContext.tsx` - 인증 상태 관리 Context ✅
- `lib/auth/serverAuth.ts` - Server Action용 인증 헬퍼
- `app/auth/callback/route.ts` - OAuth 콜백 처리 ✅

**수정 파일:**
- `lib/supabase.ts` - 브라우저/서버 클라이언트 분리 ✅
- `components/Providers.tsx` - AuthProvider 추가 ✅

### 3-2. Server Actions 수정
**파일:** `lib/actions/clothes.ts`, `lib/actions/outfits.ts`

변경사항:
- `verifyPassword()` 함수 제거
- `requireAuth()` 호출로 세션 인증
- INSERT 시 `user_id: user.id` 추가
- FormData에서 password 필드 제거

### 3-3. Hooks 수정
**파일:** `hooks/useAddClothes.ts`, `hooks/useClothesDetail.ts`, `hooks/useOutfitBuilder.ts`

변경사항:
- password 관련 state/함수 제거
- errors에서 password 필드 제거

### 3-4. UI 컴포넌트 수정

**Header.tsx:** 🔶
- z-index: `z-10` → `z-sticky`
- 우측에 로그인/프로필 버튼 추가 (현재 임시 텍스트 버튼)

**수정 파일:**
- `app/(tabs)/layout.tsx` - DemoWelcomeModal, DemoStickyBar 추가 ✅
- `components/closet/AddClothesModal.tsx` - PasswordModal 제거, 로그인 체크
- `components/closet/ClothesDetailModal.tsx` - PasswordModal 제거
- `components/outfit/OutfitSaveSection.tsx` - PasswordModal 제거
- `app/outfit/[id]/page.tsx` - PasswordModal 제거

### 3-5. 데모 모드 UI ✅

#### DemoWelcomeModal (웰컴 모달) ✅
**노출 조건:** 비로그인 + 첫 방문 시 (localStorage `demo_welcomed` 체크)
**위치:** 화면 중앙 오버레이

**디자인:**
- 오버레이: `bg-black/40`
- 카드: `bg-white rounded-2xl` + 그림자

**문구:**
```
👕 데모 모드입니다

카카오 로그인하고
나만의 옷장을 채워보세요

[로그인]  [구경하기]
```

**버튼:**
- 로그인: `bg-primary text-white` → 카카오 로그인 실행
- 구경하기: `border border-primary text-primary` → 모달 닫기 + localStorage 저장

#### DemoStickyBar (스티키 바) ✅
**노출 조건:** 비로그인 시 항상
**위치:** 헤더 바로 아래 (필터 위), sticky

**디자인:**
- 배경: `bg-secondary-2` (#E1D9BC)
- 높이: `py-2`

**문구:**
```
👀 지금 보고 있는 건 샘플이에요  [내 옷장 만들기]
```

**버튼:**
- `bg-primary text-white text-xs px-3 py-1 rounded-full`

---

### 3-6. 데모 모드 권한 체크 (NEW)

비로그인 또는 데모 데이터에 대한 수정/삭제 시도 시 로그인 유도

#### 권한 체크 로직

| 상황 | 동작 |
|------|------|
| 비로그인 + 추가 버튼 | 로그인 유도 모달 |
| 비로그인 + 수정/삭제 버튼 | 로그인 유도 모달 |
| 로그인 + 데모 데이터 수정/삭제 | "데모 데이터는 수정할 수 없어요" 토스트 |
| 로그인 + 내 데이터 수정/삭제 | 정상 동작 |

#### 구현 방식

**새 컴포넌트:** `components/ui/LoginRequiredModal.tsx`
```
로그인이 필요해요

나만의 옷장을 관리하려면
카카오 로그인을 해주세요

[로그인하기]  [취소]
```

**수정 파일:**
- `components/closet/ClothesDetailModal.tsx` - 수정/삭제 버튼에 권한 체크
- `components/outfit/OutfitSaveSection.tsx` - 저장 버튼에 권한 체크
- `app/outfit/[id]/page.tsx` - 수정/삭제 버튼에 권한 체크
- `components/closet/AddClothesModal.tsx` - 저장 버튼에 권한 체크

#### 데모 데이터 구분 방법
- DB에서 `user_id`가 NULL인 데이터 = 데모 데이터
- 프론트에서 `item.user_id === null` 체크

---

### 3-7. 마이페이지
**새 파일:** `app/mypage/page.tsx`

기능:
- 프로필 정보 표시 (닉네임, 이메일)
- 로그아웃 버튼

### 3-8. PasswordModal 제거
**삭제:** `components/ui/PasswordModal.tsx`
**수정:** `components/ui/index.ts` - export 제거

---

## Phase 4: 타입 수정

**파일:** `types/index.ts`

```typescript
// DB 타입에 user_id 추가
export interface DbClothes {
  // ... 기존 필드
  user_id: string | null;
}

export interface DbOutfit {
  // ... 기존 필드
  user_id: string | null;
}

// ClothingItem, Outfit 타입에도 user_id 추가
export interface ClothingItem {
  // ... 기존 필드
  userId: string | null;
}

export interface Outfit {
  // ... 기존 필드
  userId: string | null;
}
```

---

## Phase 5: 환경 변수 정리

- `ADMIN_PASSWORD` 제거 (더 이상 사용 안 함)
- `.env.example` 업데이트

---

## 수정 파일 목록

### 새 파일 (9개)
- `lib/auth/AuthContext.tsx` ✅
- `lib/auth/serverAuth.ts`
- `app/auth/callback/route.ts` ✅
- `app/mypage/page.tsx`
- `components/layout/LoginButton.tsx`
- `components/layout/ProfileButton.tsx`
- `components/ui/DemoWelcomeModal.tsx` ✅
- `components/ui/DemoStickyBar.tsx` ✅
- `components/ui/LoginRequiredModal.tsx`

### 수정 파일 (13개)
- `lib/supabase.ts` ✅
- `lib/actions/clothes.ts`
- `lib/actions/outfits.ts`
- `hooks/useAddClothes.ts`
- `hooks/useClothesDetail.ts`
- `hooks/useOutfitBuilder.ts`
- `components/Providers.tsx` ✅
- `components/layout/Header.tsx` 🔶
- `components/closet/AddClothesModal.tsx`
- `components/closet/ClothesDetailModal.tsx`
- `components/outfit/OutfitSaveSection.tsx`
- `app/outfit/[id]/page.tsx`
- `app/(tabs)/layout.tsx` ✅
- `types/index.ts`
- `components/ui/index.ts`

### 삭제 파일 (1개)
- `components/ui/PasswordModal.tsx`

---

## 검증 방법

### 1. 비로그인 상태
- [ ] 첫 방문 시 웰컴 모달 표시
- [ ] 웰컴 모달 닫으면 스티키 바만 표시
- [ ] 재방문 시 웰컴 모달 표시 안 됨
- [ ] 옷장/코디 탭에서 데모 데이터 조회 가능
- [ ] 추가 버튼 클릭 시 로그인 유도 모달
- [ ] 수정/삭제 버튼 클릭 시 로그인 유도 모달
- [ ] 헤더에 "로그인" 버튼 표시

### 2. 카카오 로그인
- [ ] 로그인 버튼 클릭 → 카카오 인증 → 콜백 → 리다이렉트
- [ ] 로그인 후 웰컴 모달, 스티키 바 사라짐

### 3. 로그인 상태
- [ ] 본인 데이터 + 데모 데이터 조회
- [ ] 본인 데이터 추가/수정/삭제 가능
- [ ] 데모 데이터 수정/삭제 시 토스트 메시지
- [ ] 헤더에 프로필 아이콘 표시
- [ ] 프로필 클릭 → 마이페이지

### 4. 마이페이지
- [ ] 프로필 정보 표시
- [ ] 로그아웃 버튼 동작
- [ ] 로그아웃 후 데모 모드로 전환

---

## 참고사항

- 데모 데이터: user_id가 NULL인 기존 데이터
- 새로 추가하는 데이터: 로그인한 사용자의 user_id
- RLS로 데이터 접근 제어 (클라이언트 필터링 불필요)
- 데모 데이터는 모든 사용자에게 읽기 전용으로 공개
