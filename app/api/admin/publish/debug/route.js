import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../../../lib/admin-auth";

// 환경변수 존재 여부만 확인하는 진단 엔드포인트 (값은 노출 안 함)
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  return NextResponse.json({
    PROD_SUPABASE_URL_set: !!process.env.PROD_SUPABASE_URL,
    PROD_SUPABASE_URL_len: (process.env.PROD_SUPABASE_URL || "").length,
    PROD_SUPABASE_URL_prefix: (process.env.PROD_SUPABASE_URL || "").slice(0, 20),
    PROD_SUPABASE_SERVICE_ROLE_KEY_set: !!process.env.PROD_SUPABASE_SERVICE_ROLE_KEY,
    PROD_SUPABASE_SERVICE_ROLE_KEY_len: (process.env.PROD_SUPABASE_SERVICE_ROLE_KEY || "").length,
    SUPABASE_URL_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_URL_prefix: (process.env.NEXT_PUBLIC_SUPABASE_URL || "").slice(0, 20),
    node_env: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV,
    vercel_branch: process.env.VERCEL_GIT_COMMIT_REF,
  });
}
