"use client";

import { ToastProvider } from "@/components/ui";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return <ToastProvider>{children}</ToastProvider>;
};
