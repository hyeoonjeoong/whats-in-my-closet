"use client";

import { useAuth } from "@/lib/auth/AuthContext";

export const Header = () => {
  const { user, isLoading, signInWithKakao, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-sticky bg-background">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <h1 className="text-2xl text-primary font-[family-name:var(--font-boogaloo)]">
          what&apos;s in my closet
        </h1>

        {/* 테스트용 로그인 버튼 (나중에 정리) */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="text-sm text-secondary-1">로딩...</span>
          ) : user ? (
            <button
              onClick={signOut}
              className="text-sm text-primary hover:underline"
            >
              로그아웃
            </button>
          ) : (
            <button
              onClick={signInWithKakao}
              className="text-sm text-primary hover:underline"
            >
              카카오 로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
