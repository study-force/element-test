import { NextResponse } from "next/server";
import { getSupabaseTq, isTqEnabled } from "../../../../lib/supabase-tq";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";

// GET /api/admin/tq-usage?from=YYYY-MM-DD&to=YYYY-MM-DD
// tq_results 테이블을 집계해서 반환
export async function GET(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }
  if (!isTqEnabled()) {
    return NextResponse.json({ enabled: false, error: "TQ_SUPABASE 환경변수 미설정" }, { status: 200 });
  }

  try {
    const sb = getSupabaseTq();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to   = searchParams.get("to");

    // 기간 필터는 reg_date (YYYY-MM-DD) 기준
    let q = sb.from("tq_results")
      .select("id, name, user_school_grade, user_section, reg_date, reading_score, academy_token, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (from) q = q.gte("reg_date", from);
    if (to)   q = q.lte("reg_date", to);

    const { data: rows, error } = await q;
    if (error) throw error;
    const all = rows || [];

    // KST 기준 "오늘"
    const now = new Date();
    const kst = new Date(now.getTime() + (9 * 60 - now.getTimezoneOffset()) * 60000);
    const today = kst.toISOString().slice(0, 10);

    const todayCount = all.filter(r => r.reg_date === today).length;

    // 일별 추이 (최근 30일)
    const daily = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(kst); d.setDate(d.getDate() - i);
      const s = d.toISOString().slice(0, 10);
      daily[s] = 0;
    }
    for (const r of all) {
      if (r.reg_date && r.reg_date in daily) daily[r.reg_date]++;
    }
    const dailyTrend = Object.entries(daily).map(([date, count]) => ({ date, count }));

    // 학년 분포
    const gradeCount = {};
    for (const r of all) {
      const g = r.user_school_grade || "(미입력)";
      gradeCount[g] = (gradeCount[g] || 0) + 1;
    }

    // 학원별 (academy_token) — 실제 학원 vs 내부 토큰 구분
    const academyCount = {};
    let internalCount = 0;
    let emptyCount = 0;
    for (const r of all) {
      const a = r.academy_token;
      if (!a)                             emptyCount++;
      else if (a.startsWith("sf_internal")) internalCount++;
      else                                academyCount[a] = (academyCount[a] || 0) + 1;
    }

    // 레벨 분포 (user_section) — 참고용
    const sectionCount = {};
    for (const r of all) {
      const s = r.user_section || "(미입력)";
      sectionCount[s] = (sectionCount[s] || 0) + 1;
    }

    // 최근 100건
    const recent = all.slice(0, 100).map(r => ({
      id: r.id,
      name: r.name,
      grade: r.user_school_grade,
      section: r.user_section,
      reg_date: r.reg_date,
      reading_score: r.reading_score,
      academy_token: r.academy_token,
      created_at: r.created_at,
    }));

    return NextResponse.json({
      enabled: true,
      totalCount: all.length,
      todayCount,
      dailyTrend,
      gradeCount,
      sectionCount,
      academyCount,
      internalCount,
      emptyCount,
      recent,
      filter: { from, to },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
