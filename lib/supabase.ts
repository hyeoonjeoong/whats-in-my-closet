import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 브라우저용 클라이언트 (쿠키 기반 세션 관리)
export const createBrowserClient = () => {
  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
};

// 기존 호환용 (deprecated - createBrowserClient 사용 권장)
export const supabase = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
