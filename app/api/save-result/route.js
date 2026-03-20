import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const body = await request.json();

    const { data, error } = await supabase
      .from("element_results")
      .insert([
        {
          nickname: body.nickname,
          grade: body.grade,
          user_code: body.userCode,
          result_type: body.resultType,
          top_prob: body.topProb,
          theory_pct: body.theoryPct,
          experience_pct: body.experiencePct,
          action_pct: body.actionPct,
          thinking_pct: body.thinkingPct,
          confidence: body.confidence,
          confidence_label: body.confidenceLabel,
          special_match: body.specialMatch,
          answers: body.answers,
          compare_type: body.compareType || null,
          raw_scores: body.rawScores || null,
        },
      ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
