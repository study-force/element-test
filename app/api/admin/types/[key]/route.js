import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../../lib/supabase-admin";
import { isAdminAuthenticated } from "../../../../../lib/admin-auth";

export async function PUT(request, { params }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  const { key } = await params;
  const body = await request.json();
  delete body.key;
  delete body.id;
  const { data, error } = await supabase
    .from("element_types")
    .update(body)
    .eq("key", decodeURIComponent(key))
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
