import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase-admin";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // 1) 프레임 + 문항 구조 로드
    const { data: frames, error: fErr } = await supabase
      .from("element_frames")
      .select("*")
      .order("sort_order", { ascending: true });
    if (fErr) throw fErr;

    const { data: statements, error: sErr } = await supabase
      .from("element_statements")
      .select("*")
      .order("sort_order", { ascending: true });
    if (sErr) throw sErr;

    // 2) answers 전부 로드 (answers만)
    const { data: results, error: rErr } = await supabase
      .from("element_results")
      .select("answers")
      .not("answers", "is", null);
    if (rErr) throw rErr;

    // 3) 문항별 점수 분포 집계
    // map: { "frame_id::stmt_key": { counts: [1~6], total, sum } }
    const agg = new Map();
    const keyOf = (fid, sk) => `${fid}::${sk}`;

    for (const stmt of statements) {
      agg.set(keyOf(stmt.frame_id, stmt.key), {
        counts: [0, 0, 0, 0, 0, 0],
        total: 0,
        sum: 0,
      });
    }

    for (const row of results || []) {
      const ans = row.answers;
      if (!ans || typeof ans !== "object") continue;
      for (const [frameId, rating] of Object.entries(ans)) {
        if (!rating || typeof rating !== "object") continue;
        for (const [stmtKey, score] of Object.entries(rating)) {
          const n = Number(score);
          if (!Number.isInteger(n) || n < 1 || n > 6) continue;
          const k = keyOf(frameId, stmtKey);
          const b = agg.get(k);
          if (!b) continue; // 현재 문항 구조에 없는 키는 스킵
          b.counts[n - 1]++;
          b.total++;
          b.sum += n;
        }
      }
    }

    // 4) 프레임별 조립
    const out = frames.map(f => {
      const stmts = statements
        .filter(s => s.frame_id === f.frame_id)
        .map(s => {
          const b = agg.get(keyOf(f.frame_id, s.key)) || { counts: [0,0,0,0,0,0], total: 0, sum: 0 };
          const avg = b.total > 0 ? b.sum / b.total : 0;
          return {
            key: s.key,
            text: s.text,
            pole: s.pole || null,
            counts: b.counts,
            total: b.total,
            avg: Math.round(avg * 100) / 100,
          };
        });
      return {
        id: f.frame_id,
        theme: f.theme,
        dimension: f.dimension || null,
        axisType: f.axis_type || null,
        statements: stmts,
      };
    });

    return NextResponse.json({
      totalResponses: (results || []).length,
      frames: out,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
