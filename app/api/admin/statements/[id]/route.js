import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../../lib/supabase-admin";
import { isAdminAuthenticated } from "../../../../../lib/admin-auth";

export async function PUT(request, { params }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  const { id } = await params;
  const body = await request.json();
  const { data, error } = await supabase
    .from("element_statements")
    .update(body)
    .eq("id", Number(id))
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  const { id } = await params;
  const { error } = await supabase
    .from("element_statements")
    .delete()
    .eq("id", Number(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
