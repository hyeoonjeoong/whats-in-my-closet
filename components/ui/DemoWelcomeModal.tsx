"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "./Button";

const STORAGE_KEY = "demo_welcomed";

export const DemoWelcomeModal = () => {
  const { user, isLoading, signInWithKakao } = useAuth();
  const [hasDismissed, setHasDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    // localStorage에서 초기값을 읽어오는 외부 시스템 동기화
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const handleExplore = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setHasDismissed(true);
  };

  const handleLogin = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    signInWithKakao();
  };

  // 로딩 중, 로그인 상태, 이미 닫은 경우 표시 안 함
  if (isLoading || user || hasDismissed === null || hasDismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 z-modal-backdrop bg-black/40"
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative z-modal w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl text-center">
        <div className="mb-4 text-4xl">👕</div>

        <h2 className="text-lg font-semibold text-primary mb-2">
          데모 모드입니다
        </h2>

        <p className="text-sm text-primary/70 mb-6">
          카카오 로그인하고
          <br />
          나만의 옷장을 채워보세요
        </p>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={handleExplore}
            className="flex-1 border border-primary"
          >
            구경하기
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleLogin}
            className="flex-1"
          >
            로그인
          </Button>
        </div>
      </div>
    </div>
  );
};
