import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth 콜백 에러:", error.message);
      return NextResponse.redirect(
        new URL("/?error=auth_failed", requestUrl.origin)
      );
    }
  }

  // 로그인 성공 후 메인 페이지로 리다이렉트
  return NextResponse.redirect(new URL("/closet", requestUrl.origin));
};
