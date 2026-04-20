import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase-admin";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { count: totalCount } = await supabase
      .from("element_results")
      .select("*", { count: "exact", head: true });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: todayCount } = await supabase
      .from("element_results")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString());

    const { data: allResults } = await supabase
      .from("element_results")
      .select("result_type, confidence, grade, created_at, channel");

    const typeDistribution = { 이론실행: 0, 경험실행: 0, 이론사고: 0, 경험사고: 0 };
    const confidenceDistribution = { 명확: 0, 경향: 0, 복합: 0 };
    const gradeBreakdown = {};
    const dailyMap = {};
    const channelBreakdown = {};

    (allResults || []).forEach(r => {
      if (r.result_type && typeDistribution.hasOwnProperty(r.result_type)) {
        typeDistribution[r.result_type]++;
      }
      if (r.confidence && confidenceDistribution.hasOwnProperty(r.confidence)) {
        confidenceDistribution[r.confidence]++;
      }
      if (r.channel) {
        channelBreakdown[r.channel] = (channelBreakdown[r.channel] || 0) + 1;
      }
      if (r.grade) {
        gradeBreakdown[r.grade] = (gradeBreakdown[r.grade] || 0) + 1;
      }
      if (r.created_at) {
        const day = r.created_at.slice(0, 10);
        dailyMap[day] = (dailyMap[day] || 0) + 1;
      }
    });

    const dailyTrend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyTrend.push({ date: key, count: dailyMap[key] || 0 });
    }

    return NextResponse.json({
      totalCount: totalCount || 0,
      todayCount: todayCount || 0,
      typeDistribution,
      confidenceDistribution,
      gradeBreakdown,
      dailyTrend,
      channelBreakdown,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
