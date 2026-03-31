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