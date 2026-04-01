# 옷 추가 기능 구현 계획

## 개요
옷 사진 업로드 + 카테고리/계절 선택 + 구매링크 입력 기능 구현

---

## 진행 상황

- [x] Phase 1: 공통 UI 컴포넌트 (커밋: c27483e)
- [ ] Phase 2: Supabase 연동
- [ ] Phase 3: 커스텀 훅
- [ ] Phase 4: AddClothesModal 컴포넌트
- [ ] Phase 5: 기존 파일 수정 및 연동

---

## Phase 1: 공통 UI 컴포넌트 ✅

| 파일 | 역할 |
|------|------|
| `components/ui/Button.tsx` | 범용 버튼 (variant, size, isLoading) |
| `components/ui/Input.tsx` | 텍스트 입력 필드 |
| `components/ui/Modal.tsx` | 오버레이 모달 (ESC 닫기, 스크롤 잠금) |
| `components/ui/ImageUpload.tsx` | 이미지 선택 + 미리보기 |
| `components/ui/TagSelect.tsx` | 복수 선택 태그 (계절용) |
| `components/ui/RadioGroup.tsx` | 단일 선택 (카테고리용) |
| `components/ui/index.ts` | barrel export |

---

## Phase 2: Supabase 연동

| 파일 | 역할 |
|------|------|
| `lib/storage.ts` | 이미지 업로드/삭제 (Storage) |
| `lib/api/clothes.ts` | 옷 CRUD (DB) |

---

## Phase 3: 커스텀 훅

| 파일 | 역할 |
|------|------|
| `hooks/useClothes.ts` | 옷 목록 조회 + 상태 관리 |
| `hooks/useAddClothes.ts` | 추가 폼 상태 + 유효성 검사 + 제출 |

---

## Phase 4: 기능 컴포넌트

| 파일 | 역할 |
|------|------|
| `components/closet/AddClothesModal.tsx` | 옷 추가 폼 모달 |
| `components/closet/index.ts` | export 추가 |

---

## Phase 5: 기존 파일 수정

| 파일 | 변경 내용 |
|------|----------|
| `components/layout/Header.tsx` | 우측에 + 버튼 추가 |
| `app/page.tsx` | 모달 연동 + 더미 데이터 → 실제 DB 연결 |

---

## 폼 필드

1. **이미지** (필수) - 최대 5MB, jpg/png/webp
2. **이름** (필수) - 1-50자
3. **카테고리** (필수) - 단일 선택
4. **계절** (필수) - 복수 선택, 최소 1개
5. **구매 링크** (선택) - URL 형식

---

## 검증 방법

1. `npm run dev`로 개발 서버 실행
2. Header의 + 버튼 클릭 → 모달 열림 확인
3. 이미지 선택, 이름/카테고리/계절 입력 후 추가
4. 목록에 새 옷 표시 확인
5. 새로고침 후에도 데이터 유지 확인 (DB 연동)
