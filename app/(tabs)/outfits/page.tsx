"use client";

import { useRouter } from "next/navigation";
import { Fab } from "@/components/ui";
import { Sparkles } from "lucide-react";

export default function OutfitsPage() {
  const router = useRouter();

  return (
    <>
      <div className="text-center text-secondary-1 py-12">
        <p>저장된 코디가 없습니다</p>
        <p className="mt-2 text-sm">코디를 만들어보세요</p>
      </div>

      <Fab icon={Sparkles} label="코디 만들기" onClick={() => router.push("/outfit/new")} />
    </>
  );
}
