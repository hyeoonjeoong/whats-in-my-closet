"use client";

import { Camera, Save } from "lucide-react";
import { OutfitHeader } from "@/components/outfit";

export default function NewLookbookPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <OutfitHeader title="룩북 추가" />

      <main className="flex-1 p-4 space-y-6">
        {/* 상단 섹션: 착용 사진 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Camera size={18} />
            <h2 className="font-semibold">착용 사진</h2>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            {/* TODO: 이미지 업로드 영역 */}
            <div className="aspect-[3/4] rounded-lg border-2 border-dashed border-secondary-1/50 flex items-center justify-center">
              <div className="text-center text-secondary-1">
                <Camera size={32} className="mx-auto mb-2" />
                <p className="text-sm">사진을 추가해주세요</p>
              </div>
            </div>
          </div>
        </section>

        {/* 구분선 */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-secondary-1/30" />
          <span className="text-xs text-secondary-1">룩북 정보 입력</span>
          <div className="h-px flex-1 bg-secondary-1/30" />
        </div>

        {/* 하단 섹션: 룩북 정보 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Save size={18} />
            <h2 className="font-semibold">룩북 정보</h2>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
            {/* TODO: 착용한 옷 선택 */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary">착용한 옷</p>
              <p className="text-xs text-secondary-1">옷장에서 착용한 아이템을 선택해주세요</p>
            </div>

            {/* TODO: 계절, 스타일, 무드 선택 */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary">계절 / 스타일 / 무드</p>
              <p className="text-xs text-secondary-1">추후 구현 예정</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
