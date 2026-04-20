"use client";
import React, { useState, useEffect } from "react";

const TYPE_META = {
  이론실행: { emoji: "🔥", name: "불의 정복자", color: "#3B82F6" },
  경험실행: { emoji: "🌪️", name: "바람의 전령", color: "#F59E0B" },
  이론사고: { emoji: "🪨", name: "땅의 수호자", color: "#8B5CF6" },
  경험사고: { emoji: "💧", name: "물의 정령", color: "#06B6D4" },
};
const CONF_COLORS = { 명확: "#22C55E", 경향: "#F59E0B", 복합: "#94A3B8" };

const s = {
  title: { fontSize: 24, fontWeight: 700, color: "#1E293B", marginBottom: 32 },
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 },
  statCard: {
    background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  statLabel: { fontSize: 13, color: "#64748B", marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: 700, color: "#1E293B" },
  section: { background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: "#1E293B", marginBottom: 16 },
  barRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 10 },
  barLabel: { width: 120, fontSize: 13, color: "#475569", textAlign: "right" },
  barTrack: { flex: 1, height: 28, background: "#F1F5F9", borderRadius: 6, overflow: "hidden", position: "relative" },
  barFill: (pct, color) => ({
    width: `${pct}%`, height: "100%", background: color, borderRadius: 6,
    transition: "width 0.6s ease", minWidth: pct > 0 ? 4 : 0,
  }),
  barCount: { width: 50, fontSize: 13, color: "#64748B", textAlign: "right" },
  trendContainer: { display: "flex", alignItems: "flex-end", gap: 2, height: 120 },
  trendBar: (pct, active) => ({
    flex: 1, background: active ? "#3B82F6" : "#CBD5E1", borderRadius: "3px 3px 0 0",
    height: `${Math.max(pct, 2)}%`, transition: "height 0.4s ease",
  }),
  trendLabels: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginTop: 6 },
  loading: { textAlign: "center", padding: 60, color: "#64748B", fontSize: 15 },
  doubleGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 },
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e)))
      .then(setStats)
      .catch(e => setError(e.error || "통계 로드 실패"));
  }, []);

  if (error) return <div style={s.loading}>오류: {error}</div>;
  if (!stats) return <div style={s.loading}>통계 로딩 중...</div>;

  const maxType = Math.max(...Object.values(stats.typeDistribution), 1);
  const maxDaily = Math.max(...stats.dailyTrend.map(d => d.count), 1);
  const topType = Object.entries(stats.typeDistribution).sort((a, b) => b[1] - a[1])[0];
  const maxGrade = Math.max(...Object.values(stats.gradeBreakdown), 1);
  const sortedGrades = Object.entries(stats.gradeBreakdown).sort((a, b) => b[1] - a[1]);
  const totalConf = Object.values(stats.confidenceDistribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      <h1 style={s.title}>대시보드</h1>

      {/* 요약 카드 */}
      <div style={s.grid}>
        <div style={s.statCard}>
          <div style={s.statLabel}>전체 검사 수</div>
          <div style={s.statValue}>{stats.totalCount.toLocaleString()}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>오늘 검사 수</div>
          <div style={s.statValue}>{stats.todayCount.toLocaleString()}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>가장 많은 유형</div>
          <div style={{ ...s.statValue, fontSize: 20 }}>
            {topType ? `${TYPE_META[topType[0]]?.emoji} ${TYPE_META[topType[0]]?.name}` : "-"}
          </div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>명확 판정률</div>
          <div style={s.statValue}>
            {stats.totalCount > 0 ? Math.round((stats.confidenceDistribution["명확"] / stats.totalCount) * 100) : 0}%
          </div>
        </div>
      </div>

      <div style={s.doubleGrid}>
        {/* 유형 분포 */}
        <div style={s.section}>
          <div style={s.sectionTitle}>유형 분포</div>
          {Object.entries(stats.typeDistribution).map(([key, count]) => (
            <div key={key} style={s.barRow}>
              <div style={s.barLabel}>{TYPE_META[key]?.emoji} {TYPE_META[key]?.name}</div>
              <div style={s.barTrack}>
                <div style={s.barFill((count / maxType) * 100, TYPE_META[key]?.color)} />
              </div>
              <div style={s.barCount}>{count}</div>
            </div>
          ))}
        </div>

        {/* 신뢰도 분포 */}
        <div style={s.section}>
          <div style={s.sectionTitle}>판정 신뢰도 분포</div>
          {Object.entries(stats.confidenceDistribution).map(([key, count]) => (
            <div key={key} style={s.barRow}>
              <div style={s.barLabel}>{key}</div>
              <div style={s.barTrack}>
                <div style={s.barFill((count / totalConf) * 100, CONF_COLORS[key])} />
              </div>
              <div style={s.barCount}>{count} ({Math.round((count / totalConf) * 100)}%)</div>
            </div>
          ))}
        </div>
      </div>

      {/* 일별 추이 (30일) */}
      <div style={s.section}>
        <div style={s.sectionTitle}>일별 검사 추이 (최근 30일)</div>
        <div style={s.trendContainer}>
          {stats.dailyTrend.map((d, i) => (
            <div
              key={d.date}
              style={s.trendBar((d.count / maxDaily) * 100, i === stats.dailyTrend.length - 1)}
              title={`${d.date}: ${d.count}건`}
            />
          ))}
        </div>
        <div style={s.trendLabels}>
          <span>{stats.dailyTrend[0]?.date?.slice(5)}</span>
          <span>{stats.dailyTrend[stats.dailyTrend.length - 1]?.date?.slice(5)}</span>
        </div>
      </div>

      {/* 학년별 분포 */}
      <div style={s.section}>
        <div style={s.sectionTitle}>학년별 분포</div>
        {sortedGrades.length === 0 && <div style={{ color: "#94A3B8", fontSize: 14 }}>데이터 없음</div>}
        {sortedGrades.map(([grade, count]) => (
          <div key={grade} style={s.barRow}>
            <div style={s.barLabel}>{grade}</div>
            <div style={s.barTrack}>
              <div style={s.barFill((count / maxGrade) * 100, "#64748B")} />
            </div>
            <div style={s.barCount}>{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
