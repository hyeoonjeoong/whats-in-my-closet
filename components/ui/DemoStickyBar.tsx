"use client";

import { useAuth } from "@/lib/auth/AuthContext";

export const DemoStickyBar = () => {
  const { user, isLoading, signInWithKakao } = useAuth();

  // 로딩 중이거나 로그인 상태면 표시 안 함
  if (isLoading || user) return null;

  return (
    <div className="sticky top-14 z-sticky bg-secondary-2">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2">
        <span className="text-sm text-primary">
          👀 지금 보고 있는 건 샘플이에요
        </span>
        <button
          onClick={signInWithKakao}
          className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary/90 transition-colors"
        >
          내 옷장 만들기
        </button>
      </div>
    </div>
  );
};
