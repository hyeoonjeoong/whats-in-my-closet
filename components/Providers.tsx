"use client";

import { ToastProvider } from "@/components/ui";
import { AuthProvider } from "@/lib/auth/AuthContext";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
};
