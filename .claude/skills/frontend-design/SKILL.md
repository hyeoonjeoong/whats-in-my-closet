---
name: frontend-design
description: >
  React/Next.js 컴포넌트, 페이지, UI 작업 시 자동 활성화.
  "컴포넌트 만들어줘", "페이지 구현해줘", "UI 작업해줘" 요청에 사용.
  옷장 관리 앱(whats-in-my-closet) 프론트엔드 전용 규칙.
---

# Frontend Design Skill

## 기술 스택 (고정값 — 임의 변경 금지)
- Next.js 16, React 19, TypeScript (strict mode)
- Tailwind CSS 4
- Supabase (@supabase/supabase-js)
- clsx + tailwind-merge (조건부 클래스)
- lucide-react (아이콘 전용)
- 경로 alias: `@/*` → 루트 디렉토리

---

## 절대 규칙 (위반 금지)

- `any` 타입 사용 금지
- `default export` 사용 금지 → 반드시 `named export`만
- CSS 직접 작성 금지 → Tailwind 클래스만 사용
- SVG 파일 생성 금지 → 아이콘은 반드시 `lucide-react`에서 import
- `clsx`, `tailwind-merge` 없이 조건부 클래스 문자열 직접 조합 금지

---

## 파일 생성 시 무조건 따르는 구조

컴포넌트 파일은 반드시 아래 순서로 작성:

```tsx
// 1. import (외부 라이브러리 → 내부 모듈 순)
import { useState } from 'react'
import { cn } from '@/lib/utils'

// 2. Props 인터페이스
interface ComponentNameProps {
  // ...
}

// 3. named export 컴포넌트
export const ComponentName = ({ prop }: ComponentNameProps) => {
  return (
    // ...
  )
}
```

---

## 컴포넌트 규칙

- 파일명: `PascalCase.tsx`
- Props 인터페이스명: 컴포넌트명 + `Props` (예: `ClothesCardProps`, `FilterBarProps`)
- `'use client'`는 꼭 필요한 경우에만 (이벤트 핸들러, useState, useEffect 사용 시)
- 조건부 클래스는 `cn()` 유틸 사용
- 함수 선언: 반드시 `export const` 사용 (`export function` 금지)

```tsx
import { cn } from '@/lib/utils'

// ✅
<div className={cn('base-class', isActive && 'active-class')} />

// ❌
<div className={`base-class ${isActive ? 'active-class' : ''}`} />
```

---

## 폴더 구조 (새 파일 위치 기준)

```
components/
├── ui/         # Button, Modal, Card 등 범용 공통 컴포넌트
├── closet/     # 옷장 관련 컴포넌트 (ClothingCard, FilterBar 등)
├── outfit/     # 코디 관련 컴포넌트 (OutfitCard, OutfitBuilder 등)
└── layout/     # Header, Navigation 등 레이아웃 컴포넌트

hooks/          # use로 시작하는 커스텀 훅
types/          # 타입 정의 (ClothingItem, Outfit, Season, Category)
lib/            # supabase.ts, constants.ts, utils.ts
```

---

## 디자인 시스템 (반드시 준수)

### 컬러 팔레트 — CSS 변수 사용
| 변수 | 색상 | 용도 |
|------|------|------|
| `--primary` | #30364F | 메인 컬러 |
| `--secondary-1` | #ACBAC4 | 서브 컬러 1 |
| `--secondary-2` | #E1D9BC | 서브 컬러 2 |
| `--secondary-3` | #F0F0DB | 서브 컬러 3 |
| `--background` | #F9F8F6 | 배경색 |

### 폰트
- Pretendard Variable 전용

### 아이콘
- 반드시 `lucide-react`에서 import
- SVG 직접 작성 또는 별도 SVG 파일 생성 금지

```tsx
// ✅
import { Plus, Shirt, Filter } from 'lucide-react'

// ❌
const PlusIcon = () => <svg>...</svg>
```

---

## 반응형

- 모바일 우선 작성 (모바일 기본 → `md:`, `lg:` breakpoint 확장)
- 모바일/웹 반응형 필수 적용

---

## 도메인 타입 (types/index.ts 기준)

새 컴포넌트 작성 시 아래 타입을 import해서 사용:

```tsx
import type { ClothingItem, Outfit, Season, Category } from '@/types'
```

- `Season`: `"spring"` | `"summer"` | `"fall"` | `"winter"`
- `Category`: `"top"` | `"bottom"` | `"outer"` | `"accessory"` | `"shoes"` | `"bag"`

한글 레이블이 필요할 때는 `@/lib/constants`의 상수를 사용:

```tsx
import { SEASONS, CATEGORIES } from '@/lib/constants'

// SEASONS = [{ value: "spring", label: "봄" }, ...]
// CATEGORIES = [{ value: "top", label: "상의" }, ...]
```

---

## Barrel Export (index.ts)

각 컴포넌트 폴더에는 `index.ts` barrel 파일을 생성하여 export:

```tsx
// components/closet/index.ts
export { FilterBar } from "./FilterBar";
export { ClothesCard } from "./ClothesCard";
export { ClothesList } from "./ClothesList";
```

외부에서 import 시:

```tsx
import { ClothesCard, FilterBar } from '@/components/closet'
```
