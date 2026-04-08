import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase-admin";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  const { data: frames, error: fErr } = await supabase
    .from("element_frames")
    .select("*")
    .order("sort_order", { ascending: true });
  if (fErr) return NextResponse.json({ error: fErr.message }, { status: 500 });

  const { data: statements, error: sErr } = await supabase
    .from("element_statements")
    .select("*")
    .order("sort_order", { ascending: true });
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  const result = frames.map(f => ({
    ...f,
    stmts: statements.filter(s => s.frame_id === f.frame_id),
  }));
  return NextResponse.json(result);
}

export async function POST(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  const body = await request.json();
  const { data, error } = await supabase
    .from("element_frames")
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
