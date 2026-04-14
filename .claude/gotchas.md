# Gotchas (주의사항)

프로젝트에서 반복적으로 발생할 수 있는 문제와 해결 방법을 정리합니다.

---

## Next.js Server Action + FormData 키 prefix 문제

### 문제

클라이언트에서 Server Action을 호출할 때 `FormData`를 인자로 전달하면, Next.js가 내부적으로 키에 숫자 prefix를 추가합니다.

```typescript
// 클라이언트 코드
const formData = new FormData();
formData.append("images", file1);
formData.append("images", file2);
formData.append("data", JSON.stringify({ name: "test" }));
formData.append("password", "1234");

await createClothesAction(formData);
```

**실제 전송되는 payload:**
```
1_images (binary)
1_images (binary)
1_data {"name":"test"}
1_password 1234
0 ["$K1"]
```

서버에서 `formData.get("data")`로 접근하면 `null`이 반환됩니다. 실제 키는 `1_data`이기 때문입니다.

### 해결 방법

`lib/actions/clothes.ts`에 헬퍼 함수를 사용하여 prefix가 붙은 키도 검색합니다:

```typescript
// Next.js 서버 액션에서 FormData 키의 prefix를 제거하는 헬퍼
const getFormValue = (formData: FormData, key: string): FormDataEntryValue | null => {
  // 직접 키로 먼저 시도
  const direct = formData.get(key);
  if (direct !== null) return direct;

  // prefix가 붙은 키 검색 (예: "1_images", "2_data")
  for (const [k, v] of formData.entries()) {
    if (k === key || k.endsWith(`_${key}`)) {
      return v;
    }
  }
  return null;
};

const getFormValues = (formData: FormData, key: string): FormDataEntryValue[] => {
  // 직접 키로 먼저 시도
  const direct = formData.getAll(key);
  if (direct.length > 0) return direct;

  // prefix가 붙은 키 검색
  const values: FormDataEntryValue[] = [];
  for (const [k, v] of formData.entries()) {
    if (k === key || k.endsWith(`_${key}`)) {
      values.push(v);
    }
  }
  return values;
};

// 사용
const password = getFormValue(formData, "password") as string;
const images = getFormValues(formData, "images") as File[];
```

### 주의사항

- **Server Action에 FormData를 직접 전달할 때마다 이 문제가 발생**할 수 있습니다
- 새로운 Server Action을 만들 때 반드시 이 헬퍼 함수를 사용하세요
- 코드 변경 후 **dev 서버를 재시작**해야 변경사항이 적용됩니다

---

## Server Actions Body Size 제한

### 문제

Server Actions로 파일(이미지)을 업로드할 때 기본 body size 제한(1MB)을 초과하면 `ERR_CONNECTION_RESET 400 (Bad Request)` 에러가 발생합니다.

서버 콘솔에 로그가 출력되지 않고 클라이언트에서 바로 에러가 발생하는 것이 특징입니다.

### 해결 방법

`next.config.ts`에 body size 제한 설정 추가 (`experimental` 내부에 위치해야 함):

```typescript
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // 필요에 따라 조정
    },
  },
};
```

### 주의사항

- 다중 이미지 업로드 시 총 용량이 제한을 초과하지 않도록 주의
- 변경 후 dev 서버 재시작 필요

---

## DB 스키마 변경 시 마이그레이션

### 문제

타입 정의(`types/index.ts`)를 변경해도 실제 Supabase DB 스키마는 자동으로 변경되지 않습니다.

### 해결 방법

1. `supabase/migrations/` 폴더에 마이그레이션 SQL 파일 생성
2. Supabase Dashboard에서 SQL 실행
3. 로컬 타입과 DB 스키마가 일치하는지 확인

---

## 풀스크린 오버레이에서 버튼 클릭 안됨

### 문제

`fixed inset-0`인 풀스크린 오버레이 내부에 `Image fill`과 버튼을 함께 배치하면, Image가 버튼 위를 덮어서 클릭이 안됩니다.

```tsx
// ❌ 버튼 클릭 안됨
<div className="fixed inset-0">
  <button className="absolute right-4 top-4">닫기</button>
  <Image fill className="object-contain" />
</div>
```

### 해결 방법

버튼에 `z-10`을 추가하여 Image 위에 표시되도록 합니다:

```tsx
// ✅ 버튼 클릭 가능
<div className="fixed inset-0">
  <button className="absolute right-4 top-4 z-10">닫기</button>
  <Image fill className="object-contain" />
</div>
```

---

## 모달 내 상태가 리셋되지 않음

### 문제

모달을 닫았다가 다시 열면 내부 컴포넌트의 state가 이전 값을 유지합니다. (예: 선택된 이미지 인덱스, 풀스크린 상태 등)

### 해결 방법

아이템 ID가 바뀔 때 상태를 리셋하는 `useEffect` 추가:

```tsx
const [selectedIndex, setSelectedIndex] = useState(0);
const [isFullscreen, setIsFullscreen] = useState(false);

// 아이템이 바뀌면 상태 리셋
useEffect(() => {
  setSelectedIndex(0);
  setIsFullscreen(false);
}, [item.id]);
```

---
