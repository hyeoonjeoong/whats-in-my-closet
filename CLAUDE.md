# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**내 옷장 (What's in My Closet)** - 개인 옷장 관리 및 코디 저장 웹 애플리케이션

### 핵심 기능
- 옷 사진 업로드 + 구매 링크 첨부
- 계절별 필터링 (봄, 여름, 가을, 겨울)
- 카테고리별 필터링 (상의, 하의, 아우터, 악세사리, 신발, 가방)
- 코디 조합 저장 및 관리
- 메인 홈: 옷장 탭 + 코디 목록 탭

### 기술 스택
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database/Storage**: Supabase
- **Deployment**: Vercel

## 빌드 및 실행

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
```

## 아키텍처

```
app/                    # Next.js App Router
├── page.tsx           # 메인 홈 (옷장 + 코디 탭)
├── layout.tsx         # 루트 레이아웃
└── globals.css        # 글로벌 스타일

components/
├── ui/                # 공통 UI 컴포넌트 (Button, Modal, Card 등)
├── closet/            # 옷장 관련 컴포넌트
├── outfit/            # 코디 관련 컴포넌트
└── layout/            # 레이아웃 컴포넌트 (Header, Navigation 등)

lib/
├── supabase.ts        # Supabase 클라이언트
├── constants.ts       # 상수 (계절, 카테고리 목록)
└── utils.ts           # 유틸리티 함수

types/
└── index.ts           # 타입 정의 (ClothingItem, Outfit, Season, Category)

hooks/
└── useFilter.ts       # 필터링 커스텀 훅
```

## Git 워크플로우

- **main**: 프로덕션 브랜치
- **develop**: 개발 브랜치

### 커밋 메시지 컨벤션
- `feat/기능명` - 새 기능 추가
- `ui/컴포넌트명` - UI 관련 작업
- `fix/버그명` - 버그 수정
- `refactor/대상` - 리팩토링
- `chore/작업명` - 기타 작업

## 디자인 시스템

- **폰트**: Pretendard Variable
- **아이콘**: lucide-react

### 컬러 팔레트
| 변수 | 색상 | 용도 |
|------|------|------|
| `--primary` | #30364F | 메인 컬러 |
| `--secondary-1` | #ACBAC4 | 서브 컬러 1 |
| `--secondary-2` | #E1D9BC | 서브 컬러 2 |
| `--secondary-3` | #F0F0DB | 서브 컬러 3 |
| `--background` | #F9F8F6 | 배경색 |
| `--danger` | #C44A3A | 삭제/경고 |

## 코딩 규칙

- TypeScript strict mode 사용
- 경로 alias: `@/*` → 루트 디렉토리
- 모바일/웹 반응형 필수
- 인증 없음 (개인 사용 프로젝트)

## 환경 변수

`.env.local` 파일에 설정 (`.env.example` 참고):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

@AGENTS.md
