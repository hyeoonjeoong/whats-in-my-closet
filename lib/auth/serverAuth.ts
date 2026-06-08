import { createServerSupabaseClient } from "@/lib/supabase-server";
import { User } from "@supabase/supabase-js";

export interface AuthResult {
  user: User | null;
  error: string | null;
}

// Server Action에서 인증 확인
export const getServerUser = async (): Promise<AuthResult> => {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return { user: null, error: error.message };
    }

    return { user, error: null };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : "인증 확인 실패",
    };
  }
};

// 로그인 필수 작업용 (에러 throw)
export const requireAuth = async (): Promise<User> => {
  const { user, error } = await getServerUser();

  if (error || !user) {
    throw new Error("로그인이 필요합니다");
  }

  return user;
};
