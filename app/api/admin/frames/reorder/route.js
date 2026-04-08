import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../../lib/supabase-admin";
import { isAdminAuthenticated } from "../../../../../lib/admin-auth";

export async function PUT(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  const { order } = await request.json();
  for (const item of order) {
    const { error } = await supabase
      .from("element_frames")
      .update({ sort_order: item.sort_order })
      .eq("id", item.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
