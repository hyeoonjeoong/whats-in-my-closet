---
name: frontend-design
description: >
  React/Next.js 컴포넌트, 페이지, UI 작업 시 자동 활성화.
  "컴포넌트 만들어줘", "페이지 구현해줘", "UI 작업해줘" 요청에 사용.
  옷장 관리 앱(whats-in-my-closet) 프론트엔드 전용.
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

## 컴포넌트 파일 작성 순서

```tsx
// 1. import (외부 라이브러리 → 내부 모듈 순)
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ClothingItem } from '@/types'

// 2. Props 인터페이스
interface ClothingCardProps {
  item: ClothingItem
  isSelected?: boolean
}

// 3. named export 컴포넌트
export const ClothingCard = ({ item, isSelected }: ClothingCardProps) => {
  return (
    <div className={cn('base-class', isSelected && 'selected-class')}>
      ...
    </div>
  )
}
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

## Barrel Export

각 컴포넌트 폴더에 `index.ts` 생성:

```tsx
// components/closet/index.ts
export { FilterBar } from './FilterBar'
export { ClothesCard } from './ClothesCard'
export { ClothesList } from './ClothesList'
```

외부에서 import:

```tsx
import { ClothesCard, FilterBar } from '@/components/closet'
```

---

## 디자인 시스템

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
```tsx
// ✅
import { Plus, Shirt, Filter } from 'lucide-react'

// ❌
const PlusIcon = () => <svg>...</svg>
```

### 버튼
- 클릭 가능한 버튼은 반드시 `@/components/ui`의 `Button` 또는 `IconButton` 컴포넌트 사용
- 모든 버튼 컴포넌트는 `cursor-pointer` 기본 포함

**Button** - 일반 버튼
- variant: `primary` | `secondary` | `ghost` | `danger` | `chip`
- size: `sm` | `md` | `lg`
- `chip` variant는 토글/선택 버튼용 (rounded-full, `selected` prop 사용)

```tsx
import { Button } from '@/components/ui'

// 일반 버튼
<Button variant="primary" onClick={handleClick}>클릭</Button>

// 토글/선택 버튼 (필터, 태그 등)
<Button variant="chip" selected={isSelected} onClick={handleToggle}>봄</Button>
```

**IconButton** - 아이콘 전용 원형 버튼
- variant: `primary` | `secondary` | `ghost` | `dark`
- size: `sm` | `md` | `lg`

```tsx
import { IconButton } from '@/components/ui'
import { Plus, X } from 'lucide-react'

<IconButton variant="primary" onClick={handleAdd}><Plus size={20} /></IconButton>
<IconButton variant="ghost" onClick={handleClose}><X size={20} /></IconButton>
```

```tsx
// ❌ 직접 button 태그 사용 금지
<button onClick={handleClick}>클릭</button>
```

---

## 도메인 타입

```tsx
import type { ClothingItem, Outfit, Season, Category } from '@/types'
```

- `Season`: `"spring"` | `"summer"` | `"fall"` | `"winter"`
- `Category`: `"top"` | `"bottom"` | `"outer"` | `"accessory"` | `"shoes"` | `"bag"`

한글 레이블이 필요할 때:

```tsx
import { SEASONS, CATEGORIES } from '@/lib/constants'
// SEASONS = [{ value: "spring", label: "봄" }, ...]
// CATEGORIES = [{ value: "top", label: "상의" }, ...]
```