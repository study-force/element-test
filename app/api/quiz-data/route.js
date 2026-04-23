import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // 프레임 + 문항 조회
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

    // 프레임에 문항 결합 (ElementTest.jsx 형식)
    const framesWithStmts = frames.map(f => ({
      id: f.frame_id,
      theme: f.theme,
      dimension: f.dimension || undefined,
      axisType: f.axis_type || undefined,
      stmts: statements
        .filter(s => s.frame_id === f.frame_id)
        .map(s => ({
          key: s.key,
          pole: s.pole || undefined,
          text: s.text,
        })),
    }));

    // 유형 조회
    const { data: types, error: tErr } = await supabase
      .from("element_types")
      .select("*")
      .order("sort_order", { ascending: true });

    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });

    // 유형을 key 기반 객체로 변환
    const typesMap = {};
    for (const t of types) {
      typesMap[t.key] = {
        emoji: t.emoji,
        char: t.char_name,
        name: t.type_name,
        bodyQ: t.body_question,
        slogan: t.slogan,
        subtitle: t.subtitle,
        strengths: t.strengths || [],
        weaknesses: t.weaknesses || [],
        color: t.color,
        bg: t.bg,
        accent: t.accent,
        what: t.description_what,
        how: t.description_how,
        caution: t.description_caution,
        tqDesc: t.tq_desc,
        tq: t.tq_detail,
      };
    }

    return NextResponse.json(
      { frames: framesWithStmts, types: typesMap },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
