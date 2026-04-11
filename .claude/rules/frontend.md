# Frontend Rules

프론트엔드 코드 작성 시 반드시 준수해야 하는 규칙입니다.

## 절대 규칙 (위반 금지)

- `any` 타입 사용 금지
- `default export` 사용 금지 → 반드시 `named export`만
- CSS 직접 작성 금지 → Tailwind 클래스만 사용
- SVG 파일 생성 금지 → 아이콘은 반드시 `lucide-react`에서 import
- 조건부 클래스는 반드시 `cn()` 유틸 사용 (`clsx`, `tailwind-merge` 직접 조합 금지)
- 함수 선언: 반드시 `export const` 사용 (`export function` 금지)
- `'use client'`는 꼭 필요한 경우에만 (이벤트 핸들러, useState, useEffect 사용 시)
- 파일명: `PascalCase.tsx`
- Props 인터페이스명: 컴포넌트명 + `Props` (예: `ClothesCardProps`)
- 모바일 우선 작성 (모바일 기본 → `md:`, `lg:` breakpoint 확장)

## z-index 체계

레이어 충돌 방지를 위해 반드시 정의된 z-index 클래스를 사용합니다.

| 레이어 | 클래스 | 값 | 용도 |
|--------|--------|-----|------|
| Dropdown | `z-dropdown` | 10 | 드롭다운, 셀렉트 메뉴 |
| Sticky | `z-sticky` | 20 | sticky 헤더, 고정 요소 |
| Fixed | `z-fixed` | 30 | fixed 네비게이션, FAB |
| Modal Backdrop | `z-modal-backdrop` | 40 | 모달 배경 오버레이 |
| Modal | `z-modal` | 50 | 모달 컨텐츠 |
| Toast | `z-toast` | 60 | 토스트 알림 |
| Tooltip | `z-tooltip` | 70 | 툴팁 (최상위) |

**규칙:**
- 임의의 z-index 값 사용 금지 (`z-10`, `z-50` 등 직접 사용 X)
- 모달 내부 요소는 상대적 z-index 사용 (`z-10` 등 낮은 값)

## 라우팅 규칙 (Route Group 패턴)

Next.js App Router의 Route Group을 활용한 라우팅 구조를 따릅니다.

### 탭 페이지 추가 시
`app/(tabs)/` 내에 폴더 생성:
```
app/(tabs)/새탭명/page.tsx
```
- `(tabs)/layout.tsx`의 Header + BottomNav 레이아웃 자동 적용
- `components/layout/BottomNav.tsx`에 탭 추가 필요

### 풀스크린 페이지 추가 시
`app/` 루트에 폴더 생성:
```
app/새기능/page.tsx
```
- 탭 레이아웃 없이 독립적인 페이지
- 예: `/outfit/new`, `/outfit/[id]`, `/outfit/[id]/edit`, `/lookbook/new` 등

### 금지 사항
- **조건부 렌더링으로 탭/페이지 분기 금지**
  ```tsx
  // ❌ 금지
  {activeTab === "closet" ? <ClosetView /> : <OutfitsView />}

  // ✅ 반드시 라우팅 분리
  app/(tabs)/closet/page.tsx
  app/(tabs)/outfits/page.tsx
  ```
- URL 기반 네비게이션 필수 (북마크/공유/뒤로가기 지원)