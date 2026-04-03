"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Button } from "./Button";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title?: string;
  description?: string;
  isLoading?: boolean;
  error?: string | null;
}

export const PasswordModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "비밀번호 확인",
  description = "관리자 비밀번호를 입력해주세요",
  isLoading = false,
  error = null,
}: PasswordModalProps) => {
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    await onConfirm(password);
  };

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-secondary-1">{description}</p>

        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error ?? undefined}
          autoFocus
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            type="submit"
            className="flex-1"
            isLoading={isLoading}
            disabled={!password.trim()}
          >
            확인
          </Button>
        </div>
      </form>
    </Modal>
  );
};
