import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase-admin";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";

// GET /api/admin/history?type=statements|frames|types&frame_id=...&key=...&limit=200
export async function GET(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "statements";
    const frameId = searchParams.get("frame_id");
    const key = searchParams.get("key");
    const limit = Math.min(Number(searchParams.get("limit")) || 200, 1000);

    let table;
    if (type === "statements")   table = "element_statements_history";
    else if (type === "frames")  table = "element_frames_history";
    else if (type === "types")   table = "element_types_history";
    else return NextResponse.json({ error: "invalid type" }, { status: 400 });

    let q = supabase.from(table).select("*").order("changed_at", { ascending: false }).limit(limit);
    if (type === "statements") {
      if (frameId) q = q.eq("frame_id", frameId);
      if (key)     q = q.eq("key", key);
    } else if (type === "frames" && frameId) {
      q = q.eq("frame_id", frameId);
    } else if (type === "types" && key) {
      q = q.eq("key", key);
    }

    const { data, error } = await q;
    if (error) throw error;

    return NextResponse.json({ type, rows: data || [] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
