import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase 환경변수 누락" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await request.json();

    // 데이터 정제 - 숫자 필드가 NaN이면 null로 변환
    const safeNum = (v) => (v === undefined || v === null || isNaN(v)) ? null : Number(v);
    const safeStr = (v) => (v === undefined || v === null) ? null : String(v);

    const insertData = {
      nickname: safeStr(body.nickname),
      grade: safeStr(body.grade),
      user_code: safeStr(body.userCode),
      result_type: safeStr(body.resultType) || "unknown",
      top_prob: safeNum(body.topProb),
      theory_pct: safeNum(body.theoryPct),
      experience_pct: safeNum(body.experiencePct),
      action_pct: safeNum(body.actionPct),
      thinking_pct: safeNum(body.thinkingPct),
      confidence: safeStr(body.confidence),
      confidence_label: safeStr(body.confidenceLabel),
      special_match: body.specialMatch === true,
      answers: body.answers || null,
      compare_type: safeStr(body.compareType),
      raw_scores: body.rawScores || null,
      channel: safeStr(body.channel),
      ref_code: safeStr(body.refCode),
    };

    const { data, error } = await supabase
      .from("element_results")
      .insert([insertData]);

    if (error) {
      return NextResponse.json({ error: error.message, detail: error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
