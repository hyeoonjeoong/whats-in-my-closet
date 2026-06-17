import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 브라우저용 클라이언트 (기존 호환)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 브라우저용 클라이언트 (Auth 전용 - 세션 관리)
export const createBrowserClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};
