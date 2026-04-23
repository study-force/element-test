import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../../lib/supabase-admin";
import { getSupabaseProd, isProdPublishEnabled } from "../../../../../lib/supabase-prod";
import { isAdminAuthenticated } from "../../../../../lib/admin-auth";

// 비교 대상 테이블 정의
// idCols: 매칭 기준 컬럼(복합키 가능), compareCols: 비교할 필드
const TABLES = {
  statements: {
    table: "element_statements",
    idCols: ["frame_id", "key"],
    compareCols: ["pole", "text", "sort_order"],
    labelCols: ["frame_id", "key"],
  },
  frames: {
    table: "element_frames",
    idCols: ["frame_id"],
    compareCols: ["theme", "dimension", "axis_type", "sort_order"],
    labelCols: ["frame_id"],
  },
  types: {
    table: "element_types",
    idCols: ["key"],
    compareCols: [
      "emoji", "char_name", "type_name", "body_question", "slogan", "subtitle",
      "strengths", "weaknesses", "color", "bg", "accent",
      "description_what", "description_how", "description_caution",
      "tq_desc", "tq_detail", "sort_order",
    ],
    labelCols: ["key", "type_name"],
  },
};

const canon = (v) => {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) return JSON.stringify(v);
  if (typeof v === "object") return JSON.stringify(v);
  return v;
};

export async function GET(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  if (!isProdPublishEnabled()) {
    return NextResponse.json({ enabled: false, error: "PROD_SUPABASE 환경변수 미설정" }, { status: 200 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "statements";
    const cfg = TABLES[type];
    if (!cfg) return NextResponse.json({ error: "invalid type" }, { status: 400 });

    const dev  = getSupabaseAdmin();
    const prod = getSupabaseProd();

    const selectCols = ["id", ...cfg.idCols, ...cfg.labelCols, ...cfg.compareCols];
    const uniqCols = Array.from(new Set(selectCols)).join(",");

    const [devR, prodR] = await Promise.all([
      dev.from(cfg.table).select(uniqCols),
      prod.from(cfg.table).select(uniqCols),
    ]);
    if (devR.error)  throw devR.error;
    if (prodR.error) throw prodR.error;

    const keyOf = (row) => cfg.idCols.map(c => row[c] ?? "").join("::");
    const prodMap = new Map((prodR.data || []).map(r => [keyOf(r), r]));
    const devMap  = new Map((devR.data  || []).map(r => [keyOf(r), r]));

    const rows = [];

    // dev 기준 비교
    for (const [k, d] of devMap) {
      const p = prodMap.get(k);
      if (!p) {
        rows.push({
          key: k,
          status: "new",              // dev 에만 존재
          label: cfg.labelCols.map(c => d[c]).join(" · "),
          idValues: Object.fromEntries(cfg.idCols.map(c => [c, d[c]])),
          dev: d,
          prod: null,
          changed: cfg.compareCols.map(c => ({ field: c, from: null, to: d[c] })),
        });
        continue;
      }
      const changed = [];
      for (const c of cfg.compareCols) {
        if (canon(d[c]) !== canon(p[c])) {
          changed.push({ field: c, from: p[c], to: d[c] });
        }
      }
      if (changed.length > 0) {
        rows.push({
          key: k,
          status: "diff",
          label: cfg.labelCols.map(c => d[c]).join(" · "),
          idValues: Object.fromEntries(cfg.idCols.map(c => [c, d[c]])),
          dev: d,
          prod: p,
          changed,
        });
      }
    }

    // prod 에만 존재 (dev 에서 삭제된 것) — 정보만 표시, 삭제 반영은 지원 안 함
    for (const [k, p] of prodMap) {
      if (!devMap.has(k)) {
        rows.push({
          key: k,
          status: "prod_only",
          label: cfg.labelCols.map(c => p[c]).join(" · "),
          idValues: Object.fromEntries(cfg.idCols.map(c => [c, p[c]])),
          dev: null,
          prod: p,
          changed: [],
        });
      }
    }

    return NextResponse.json({
      enabled: true,
      type,
      rows,
      counts: {
        total: rows.length,
        diff: rows.filter(r => r.status === "diff").length,
        new:  rows.filter(r => r.status === "new").length,
        prod_only: rows.filter(r => r.status === "prod_only").length,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
