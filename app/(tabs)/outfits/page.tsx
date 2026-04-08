"use client";

import { useRouter } from "next/navigation";
import { Fab } from "@/components/ui";
import { OutfitCard } from "@/components/outfit";
import { useOutfits } from "@/hooks/useOutfits";
import { Sparkles } from "lucide-react";

export default function OutfitsPage() {
  const router = useRouter();
  const { outfits, isLoading, error } = useOutfits();

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <Fab icon={Sparkles} label="코디 만들기" onClick={() => router.push("/outfit/new")} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="text-center text-red-500 py-12">
          <p>{error}</p>
        </div>
        <Fab icon={Sparkles} label="코디 만들기" onClick={() => router.push("/outfit/new")} />
      </>
    );
  }

  return (
    <>
      {outfits.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {outfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              onClick={() => router.push(`/outfit/${outfit.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-secondary-1 py-12">
          <p>저장된 코디가 없습니다</p>
          <p className="mt-2 text-sm">코디를 만들어보세요</p>
        </div>
      )}

      <Fab icon={Sparkles} label="코디 만들기" onClick={() => router.push("/outfit/new")} />
    </>
  );
}
