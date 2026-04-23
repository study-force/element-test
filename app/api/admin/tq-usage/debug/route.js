import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../../../lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  return NextResponse.json({
    TQ_SUPABASE_URL_set: !!process.env.TQ_SUPABASE_URL,
    TQ_SUPABASE_URL_len: (process.env.TQ_SUPABASE_URL || "").length,
    TQ_SUPABASE_URL_prefix: (process.env.TQ_SUPABASE_URL || "").slice(0, 30),
    TQ_SUPABASE_SERVICE_ROLE_KEY_set: !!process.env.TQ_SUPABASE_SERVICE_ROLE_KEY,
    TQ_SUPABASE_SERVICE_ROLE_KEY_len: (process.env.TQ_SUPABASE_SERVICE_ROLE_KEY || "").length,
    vercel_env: process.env.VERCEL_ENV,
    vercel_branch: process.env.VERCEL_GIT_COMMIT_REF,
  });
}
