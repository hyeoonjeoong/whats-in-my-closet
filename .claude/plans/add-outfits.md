# 코디 추가 기능 구현 계획

## 개요

옷장의 아이템들을 선택하여 코디 조합을 만드는 기능 구현

---

## 1. 파일 구조

### 새로 생성할 파일

```
app/
└── outfit/
    ├── new/
    │   └── page.tsx              # 코디 만들기 (풀스크린)
    └── [id]/
        ├── page.tsx              # 코디 상세 (풀스크린)
        └── edit/
            └── page.tsx          # 코디 수정 (풀스크린)

components/outfit/
├── index.ts                      # barrel export
├── OutfitHeader.tsx              # 뒤로가기 + 타이틀
├── SelectableClothesGrid.tsx     # 옷 선택 그리드 (페이지네이션)
├── SelectableClothesCard.tsx     # 선택 가능한 카드
├── OutfitCollage.tsx             # 콜라주 프리뷰
├── CollageSlot.tsx               # 개별 슬롯
├── OutfitSaveSection.tsx         # 계절 선택 + 저장
└── OutfitCard.tsx                # 목록용 카드 (콜라주 썸네일)

hooks/
├── useOutfitBuilder.ts           # 코디 선택 상태 관리
└── useOutfits.ts                 # 코디 목록 CRUD + 다음 코디 이름 생성

lib/
├── api/outfits.ts                # Outfit API
└── actions/outfits.ts            # Outfit Server Actions
```

---

## 2. 페이지 레이아웃

### `/outfit/new` - 코디 만들기

```
┌─────────────────────────────────────┐
│ ← 코디 만들기                       │  ← OutfitHeader (sticky)
├─────────────────────────────────────┤
│ [상의][하의][아우터][악세][신발][가방]│  ← 카테고리 필터
├─────────────────────────────────────┤
│ [봄] [여름] [가을] [겨울]           │  ← 계절 필터
├─────────────────────────────────────┤
│ ┌──┐┌──┐┌──┐┌──┐┌──┐               │
│ │1 ││2 ││3 ││4 ││5 │               │  ← SelectableClothesGrid
│ └──┘└──┘└──┘└──┘└──┘               │     (최대 2줄, 페이지네이션)
│ ┌──┐┌──┐                           │
│ │6 ││7 │  [< 1 2 3 >]              │
│ └──┘└──┘                           │
├─────────────────────────────────────┤
│                                     │
│    ┌──────┐  ┌──────┐              │  ← OutfitCollage
│    │ 상의 │  │아우터│              │
│    └──────┘  └──────┘              │
│       ┌──────┐                     │
│       │ 하의 │                     │
│       └──────┘                     │
│       ┌──────┐                     │
│       │ 신발 │                     │
│       └──────┘                     │
│ ┌────┐┌────┐┌────┐...              │  ← 가방 + 악세사리 (가로 배치)
│ │가방││악세││악세│                 │
│ └────┘└────┘└────┘                 │
│                                     │
├─────────────────────────────────────┤
│ 계절: [봄][여름][가을][겨울]        │  ← OutfitSaveSection
│            [저장하기]               │
└─────────────────────────────────────┘
```

---

## 3. 컴포넌트 설계

### 3.1 SelectableClothesCard
- 기존 ClothesCard 확장
- 선택 시 체크 오버레이 + 테두리 강조
- 대표 이미지(첫 번째) 표시

### 3.2 SelectableClothesGrid
- 필터 적용된 아이템 표시
- 최대 2줄 (한 줄 5개 = 10개)
- 페이지네이션: `[< 1 2 3 >]`
- 필터 변경 시 1페이지로 리셋

### 3.3 CollageSlot
- **빈 상태**: 점선 테두리 + "상의" 라벨
- **선택 상태**: 대표 이미지 + X 삭제 버튼
- 크기: 카테고리별 다름 (상의/하의 크게, 악세 작게)
- **비율**: 정사각형 (aspect-square)

### 3.4 OutfitCollage
- 레이아웃 배치:
  - 1행: 상의, 아우터 (나란히)
  - 2행: 하의 (중앙)
  - 3행: 신발 (중앙)
  - 4행: 가방, 악세사리들 (가로 배치, 넘치면 줄바꿈)

### 3.5 OutfitSaveSection
- 코디 이름 입력 (선택)
- **자동 이름 생성**: "코디 1", "코디 2", "코디 3"... 형식
  - 기존 코디 중 "코디 N" 패턴의 최대 N을 찾아 N+1 사용
  - 예: "코디 1", "겨울이쁜코디", "코디 2" 있으면 → 다음은 "코디 3"
- 계절 태그 선택 (TagSelect 재사용)
- 저장 버튼 (최소 1개 선택 시 활성화)

### 3.6 OutfitCard (목록용 썸네일)
- **OutfitCollage와 동일한 레이아웃** 유지
- 각 슬롯 **정사각형 비율** (aspect-square)
- 등록된 아이템만 해당 위치에 표시
- 없는 아이템은 빈 공간으로 처리

```
┌─────────────────┐
│ [상의] [아우터] │  ← 1행
├─────────────────┤
│    [하의]       │  ← 2행
├─────────────────┤
│   [신발]        │  ← 3행
├─────────────────┤
│ [가방] [악세]   │  ← 4행
└─────────────────┘
```

---

## 4. 상태 관리 (useOutfitBuilder)

```typescript
interface OutfitSelection {
  top: ClothingItem | null;
  outer: ClothingItem | null;
  bottom: ClothingItem | null;
  shoes: ClothingItem | null;
  bag: ClothingItem | null;
  accessories: ClothingItem[];  // 다중
}

// 선택 규칙
- 상의/아우터/하의/신발/가방: 단일 선택 (재선택 시 교체)
- 악세사리: 다중 선택 (토글)
```

---

## 5. API/Server Actions

### lib/api/outfits.ts
```typescript
getOutfits(): Promise<Outfit[]>
getOutfitById(id): Promise<Outfit>
```

### lib/actions/outfits.ts
```typescript
createOutfitAction(formData): Promise<ActionResult<Outfit>>
updateOutfitAction(formData): Promise<ActionResult<Outfit>>
deleteOutfitAction(formData): Promise<ActionResult<void>>
```

### hooks/useOutfits.ts
```typescript
// 다음 코디 이름 자동 생성
getNextOutfitName(): string  // "코디 N" 패턴에서 최대 N+1 반환
```

---

## 6. DB 테이블 (이미 존재)

```sql
-- outfits: 코디 정보
-- outfit_items: 코디-옷 연결 (N:M)

조회 쿼리:
SELECT outfits.*, outfit_items.clothing_id, clothes.*
FROM outfits
LEFT JOIN outfit_items ON outfits.id = outfit_items.outfit_id
LEFT JOIN clothes ON outfit_items.clothing_id = clothes.id
```

---

## 7. URL 구조

| 경로 | 설명 | 레이아웃 |
|------|------|----------|
| `/outfits` | 코디 목록 | (tabs) |
| `/outfit/new` | 코디 만들기 | 풀스크린 |
| `/outfit/[id]` | 코디 상세 | 풀스크린 |
| `/outfit/[id]/edit` | 코디 수정 | 풀스크린 |

---

## 8. 코디 목록 페이지 (`/outfits`) 업데이트

### OutfitCard 컴포넌트
- OutfitCollage와 동일한 레이아웃의 썸네일
- 각 아이템 정사각형 비율 유지
- 코디 이름 표시
- 계절 태그 표시
- 클릭 시 상세 페이지로 이동

---

## 9. 코디 상세 페이지 (`/outfit/[id]`)

- 저장된 콜라주 표시
- 아이템 클릭 → ClothesDetailModal 표시
- **로컬 상태로 모달 관리** (URL 쿼리 파라미터 사용 안함)
  - 모달 닫기 후 뒤로가기 시 모달 재표시 방지
- 수정/삭제 버튼

---

## 10. 구현 순서

### Phase 1: 기반
1. `lib/api/outfits.ts` - API 함수
2. `lib/actions/outfits.ts` - Server Actions
3. `hooks/useOutfitBuilder.ts` - 선택 상태 관리
4. `hooks/useOutfits.ts` - 코디 목록 관리 + getNextOutfitName

### Phase 2: 컴포넌트
5. `CollageSlot.tsx` - 슬롯 컴포넌트
6. `OutfitCollage.tsx` - 콜라주 영역
7. `SelectableClothesCard.tsx` - 선택 카드
8. `SelectableClothesGrid.tsx` - 그리드 + 페이지네이션
9. `OutfitHeader.tsx` - 헤더
10. `OutfitSaveSection.tsx` - 저장 영역
11. `OutfitCard.tsx` - 목록용 카드 (콜라주 레이아웃 썸네일)
12. `index.ts` - barrel export

### Phase 3: 페이지
13. `app/outfit/new/page.tsx` - 코디 만들기
14. `app/outfit/[id]/page.tsx` - 코디 상세
15. `app/outfit/[id]/edit/page.tsx` - 코디 수정
16. `app/(tabs)/outfits/page.tsx` - 코디 목록 업데이트

---

## 11. 검증 방법

1. 로컬 dev 서버에서 `/outfit/new` 접근
2. 필터링으로 옷 선택
3. 콜라주에 아이템 배치 확인
4. 저장 후 `/outfits`에서 목록 확인
5. 코디 상세에서 아이템 클릭 → 모달 확인
6. 모달 닫기 후 뒤로가기 → 모달 재표시 안됨 확인
7. 코디 수정 기능 테스트
8. 코디 이름 미입력 시 "코디 N" 자동 생성 확인
