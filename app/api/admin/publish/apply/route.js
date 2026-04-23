import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../../lib/supabase-admin";
import { getSupabaseProd, isProdPublishEnabled } from "../../../../../lib/supabase-prod";
import { isAdminAuthenticated } from "../../../../../lib/admin-auth";

const TABLES = {
  statements: {
    table: "element_statements",
    idCols: ["frame_id", "key"],
    writeCols: ["pole", "text", "sort_order"],
    insertCols: ["frame_id", "key", "pole", "text", "sort_order"],
  },
  frames: {
    table: "element_frames",
    idCols: ["frame_id"],
    writeCols: ["theme", "dimension", "axis_type", "sort_order"],
    insertCols: ["frame_id", "theme", "dimension", "axis_type", "sort_order"],
  },
  types: {
    table: "element_types",
    idCols: ["key"],
    writeCols: [
      "emoji", "char_name", "type_name", "body_question", "slogan", "subtitle",
      "strengths", "weaknesses", "color", "bg", "accent",
      "description_what", "description_how", "description_caution",
      "tq_desc", "tq_detail", "sort_order",
    ],
    insertCols: [
      "key", "emoji", "char_name", "type_name", "body_question", "slogan", "subtitle",
      "strengths", "weaknesses", "color", "bg", "accent",
      "description_what", "description_how", "description_caution",
      "tq_desc", "tq_detail", "sort_order",
    ],
  },
};

// body: { type, items: [ { ...idCols } ] }
export async function POST(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  if (!isProdPublishEnabled()) {
    return NextResponse.json({ error: "PROD_SUPABASE 환경변수 미설정" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const type = body.type || "statements";
    const items = Array.isArray(body.items) ? body.items : [];
    const cfg = TABLES[type];
    if (!cfg) return NextResponse.json({ error: "invalid type" }, { status: 400 });
    if (items.length === 0) return NextResponse.json({ error: "items 비어있음" }, { status: 400 });

    const dev  = getSupabaseAdmin();
    const prod = getSupabaseProd();

    const results = { updated: 0, inserted: 0, failed: [] };

    // item 하나씩 순차 처리 (안전성 우선, 항목 수가 많지 않음)
    for (const it of items) {
      try {
        // 1) dev 에서 해당 행 조회
        let devQ = dev.from(cfg.table).select(cfg.insertCols.join(","));
        for (const c of cfg.idCols) devQ = devQ.eq(c, it[c]);
        const { data: devRow, error: devErr } = await devQ.maybeSingle();
        if (devErr) throw devErr;
        if (!devRow) throw new Error("dev 에 없음");

        // 2) prod 에 존재 여부 확인
        let prodQ = prod.from(cfg.table).select("id");
        for (const c of cfg.idCols) prodQ = prodQ.eq(c, it[c]);
        const { data: prodRow, error: prodErr } = await prodQ.maybeSingle();
        if (prodErr) throw prodErr;

        if (prodRow) {
          // UPDATE
          const patch = Object.fromEntries(cfg.writeCols.map(c => [c, devRow[c]]));
          let upQ = prod.from(cfg.table).update(patch);
          for (const c of cfg.idCols) upQ = upQ.eq(c, it[c]);
          const { error } = await upQ;
          if (error) throw error;
          results.updated++;
        } else {
          // INSERT
          const ins = Object.fromEntries(cfg.insertCols.map(c => [c, devRow[c]]));
          const { error } = await prod.from(cfg.table).insert([ins]);
          if (error) throw error;
          results.inserted++;
        }
      } catch (e) {
        results.failed.push({ item: it, error: e.message || String(e) });
      }
    }

    return NextResponse.json({
      success: results.failed.length === 0,
      ...results,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
