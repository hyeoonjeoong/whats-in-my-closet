"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "./Button";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const LoginRequiredModal = ({
  isOpen,
  onClose,
  title = "로그인이 필요해요",
  description = "나만의 옷장을 관리하려면\n카카오 로그인을 해주세요",
}: LoginRequiredModalProps) => {
  const { signInWithKakao } = useAuth();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    signInWithKakao();
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 z-modal-backdrop bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative z-modal w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl text-center">
        <div className="mb-4 text-4xl">🔐</div>

        <h2 className="text-lg font-semibold text-primary mb-2">{title}</h2>

        <p className="text-sm text-primary/70 mb-6 whitespace-pre-line">
          {description}
        </p>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            className="flex-1 border border-primary"
          >
            취소
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleLogin}
            className="flex-1"
          >
            로그인하기
          </Button>
        </div>
      </div>
    </div>
  );
};
