"use client";
import React, { useEffect, useState } from "react";

function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

export default function TqUsagePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo]     = useState("");

  const load = () => {
    setLoading(true); setError(null);
    const p = new URLSearchParams();
    if (from) p.set("from", from);
    if (to)   p.set("to", to);
    const qs = p.toString();
    fetch("/api/admin/tq-usage" + (qs ? "?" + qs : ""))
      .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e)))
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.error || "로드 실패"); setLoading(false); });
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [from, to]);

  const applyPreset = (preset) => {
    const t = todayStr();
    if (preset === "all")        { setFrom(""); setTo(""); }
    else if (preset === "today") { setFrom(t); setTo(t); }
    else if (preset === "7d") {
      const d = new Date(); d.setDate(d.getDate() - 6);
      const pad = (n) => String(n).padStart(2, "0");
      setFrom(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`); setTo(t);
    } else if (preset === "30d") {
      const d = new Date(); d.setDate(d.getDate() - 29);
      const pad = (n) => String(n).padStart(2, "0");
      setFrom(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`); setTo(t);
    }
  };

  if (data && data.enabled === false) {
    return (
      <div style={{ padding: 40 }}>
        <h1 style={S.title}>TQ 이용 내역</h1>
        <div style={S.disabled}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>TQ 연결이 설정되지 않았습니다.</div>
          <div style={{ fontSize: 13, color: "#64748B" }}>
            환경변수 <code>TQ_SUPABASE_URL</code> / <code>TQ_SUPABASE_SERVICE_ROLE_KEY</code> 설정이 필요합니다.
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div style={{ padding: 40, color: "#991B1B" }}>오류: {error}</div>;
  if (!data) return <div style={{ padding: 40, color: "#64748B" }}>로딩 중…</div>;

  const maxDaily = Math.max(...data.dailyTrend.map(d => d.count), 1);
  const topSections = Object.entries(data.sectionCount).sort((a,b) => b[1]-a[1]).slice(0, 10);
  const topAcademies = Object.entries(data.academyCount).sort((a,b) => b[1]-a[1]).slice(0, 10);
  const gradeRows = Object.entries(data.gradeCount).sort((a,b) => b[1]-a[1]);
  const maxGrade = Math.max(...gradeRows.map(g => g[1]), 1);
  const maxSection = Math.max(...topSections.map(g => g[1]), 1);
  const maxAcademy = Math.max(...topAcademies.map(g => g[1]), 1);

  return (
    <div style={{ padding: "32px 40px" }}>
      <h1 style={S.title}>TQ 이용 내역</h1>

      {/* 날짜 필터 */}
      <div style={S.filterBar}>
        <button onClick={() => applyPreset("all")}   style={S.presetBtn(!from && !to)}>전체</button>
        <button onClick={() => applyPreset("today")} style={S.presetBtn(false)}>오늘</button>
        <button onClick={() => applyPreset("7d")}    style={S.presetBtn(false)}>7일</button>
        <button onClick={() => applyPreset("30d")}   style={S.presetBtn(false)}>30일</button>
        <span style={{ color:"#CBD5E1", margin:"0 4px" }}>|</span>
        <label style={{ color:"#64748B", fontSize:13 }}>시작</label>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={S.dateInput}/>
        <label style={{ color:"#64748B", fontSize:13 }}>종료</label>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={S.dateInput}/>
        {loading && <span style={{ color:"#94A3B8", fontSize:12 }}>업데이트 중…</span>}
      </div>

      {/* 요약 */}
      <div style={S.grid4}>
        <div style={S.statCard}>
          <div style={S.statLabel}>기간 내 검사 수</div>
          <div style={S.statValue}>{data.totalCount.toLocaleString()}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLabel}>오늘 검사 수</div>
          <div style={S.statValue}>{data.todayCount.toLocaleString()}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLabel}>활동 컨설턴트 수</div>
          <div style={S.statValue}>{Object.keys(data.sectionCount).length.toLocaleString()}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLabel}>활동 학원 수</div>
          <div style={S.statValue}>{Object.keys(data.academyCount).length.toLocaleString()}</div>
        </div>
      </div>

      {/* 일별 추이 */}
      <div style={S.section}>
        <div style={S.sectionTitle}>일별 검사 추이 (최근 30일)</div>
        <div style={S.trendContainer}>
          {data.dailyTrend.map((d, i) => (
            <div key={d.date} style={S.trendBar((d.count / maxDaily) * 100)} title={`${d.date}: ${d.count}건`}/>
          ))}
        </div>
        <div style={S.trendLabels}>
          <span>{data.dailyTrend[0]?.date?.slice(5)}</span>
          <span>{data.dailyTrend[data.dailyTrend.length - 1]?.date?.slice(5)}</span>
        </div>
      </div>

      <div style={S.grid2}>
        {/* 컨설턴트 Top 10 */}
        <div style={S.section}>
          <div style={S.sectionTitle}>컨설턴트 Top 10 (user_section)</div>
          {topSections.length === 0 && <div style={S.empty}>데이터 없음</div>}
          {topSections.map(([name, cnt]) => (
            <div key={name} style={S.barRow}>
              <div style={S.barLabel} title={name}>{name}</div>
              <div style={S.barTrack}><div style={S.barFill((cnt/maxSection)*100, "#3B82F6")}/></div>
              <div style={S.barCount}>{cnt}</div>
            </div>
          ))}
        </div>

        {/* 학원 Top 10 */}
        <div style={S.section}>
          <div style={S.sectionTitle}>학원 Top 10 (academy_token)</div>
          {topAcademies.length === 0 && <div style={S.empty}>데이터 없음</div>}
          {topAcademies.map(([token, cnt]) => (
            <div key={token} style={S.barRow}>
              <div style={S.barLabel} title={token}>{token.length > 14 ? token.slice(0, 12) + "…" : token}</div>
              <div style={S.barTrack}><div style={S.barFill((cnt/maxAcademy)*100, "#8B5CF6")}/></div>
              <div style={S.barCount}>{cnt}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 학년 분포 */}
      <div style={S.section}>
        <div style={S.sectionTitle}>학년 분포</div>
        {gradeRows.length === 0 && <div style={S.empty}>데이터 없음</div>}
        {gradeRows.map(([g, cnt]) => (
          <div key={g} style={S.barRow}>
            <div style={S.barLabel}>{g}</div>
            <div style={S.barTrack}><div style={S.barFill((cnt/maxGrade)*100, "#64748B")}/></div>
            <div style={S.barCount}>{cnt}</div>
          </div>
        ))}
      </div>

      {/* 최근 검사 */}
      <div style={S.section}>
        <div style={S.sectionTitle}>최근 검사 (최대 100건)</div>
        <div style={{ overflowX:"auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>등록일</th>
                <th style={S.th}>이름</th>
                <th style={S.th}>학년</th>
                <th style={S.th}>컨설턴트</th>
                <th style={S.th}>학원 토큰</th>
                <th style={S.th}>독해력</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map(r => (
                <tr key={r.id} style={S.tr}>
                  <td style={S.td}>{r.reg_date}</td>
                  <td style={S.td}>{r.name}</td>
                  <td style={S.td}>{r.grade}</td>
                  <td style={S.td}>{r.section || "-"}</td>
                  <td style={{ ...S.td, fontFamily:"monospace", fontSize:11, color:"#64748B" }}>
                    {r.academy_token ? (r.academy_token.length > 16 ? r.academy_token.slice(0, 12) + "…" : r.academy_token) : "-"}
                  </td>
                  <td style={S.td}>{r.reading_score}</td>
                </tr>
              ))}
              {data.recent.length === 0 && (
                <tr><td colSpan={6} style={{ ...S.td, textAlign:"center", color:"#94A3B8", padding:24 }}>데이터 없음</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const S = {
  title: { fontSize: 24, fontWeight: 700, color: "#1E293B", marginBottom: 24 },
  disabled: { padding: 32, background: "#fff", borderRadius: 12, border: "1px dashed #CBD5E1", maxWidth: 600 },
  filterBar: { display:"flex", alignItems:"center", gap:8, marginBottom:20, flexWrap:"wrap" },
  presetBtn: (active) => ({
    padding:"6px 12px", border:"1px solid #E2E8F0", borderRadius:6,
    background: active ? "#3B82F6" : "#fff",
    color: active ? "#fff" : "#475569",
    cursor:"pointer", fontSize:12,
  }),
  dateInput: { padding:"5px 8px", border:"1px solid #E2E8F0", borderRadius:6, fontSize:13, color:"#1E293B" },
  grid4: { display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:24 },
  grid2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:24 },
  statCard: { background:"#fff", borderRadius:12, padding:"20px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" },
  statLabel: { fontSize:13, color:"#64748B", marginBottom:6 },
  statValue: { fontSize:28, fontWeight:700, color:"#1E293B" },
  section: { background:"#fff", borderRadius:12, padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", marginBottom:24 },
  sectionTitle: { fontSize:16, fontWeight:600, color:"#1E293B", marginBottom:16 },
  empty: { color:"#94A3B8", fontSize:13, padding:"12px 0" },
  barRow: { display:"flex", alignItems:"center", gap:12, marginBottom:8 },
  barLabel: { width:120, fontSize:13, color:"#475569", textAlign:"right", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  barTrack: { flex:1, height:24, background:"#F1F5F9", borderRadius:6, overflow:"hidden" },
  barFill: (pct, color) => ({ width:`${pct}%`, height:"100%", background:color, borderRadius:6, transition:"width 0.4s ease", minWidth: pct>0?4:0 }),
  barCount: { width:50, fontSize:13, color:"#64748B", textAlign:"right" },
  trendContainer: { display:"flex", alignItems:"flex-end", gap:2, height:120 },
  trendBar: (pct) => ({ flex:1, background:"#3B82F6", borderRadius:"3px 3px 0 0", height:`${Math.max(pct, 2)}%`, transition:"height 0.4s ease" }),
  trendLabels: { display:"flex", justifyContent:"space-between", fontSize:11, color:"#94A3B8", marginTop:6 },
  table: { width:"100%", borderCollapse:"collapse", fontSize:13 },
  th: { textAlign:"left", padding:"10px 12px", borderBottom:"1px solid #E2E8F0", color:"#64748B", fontWeight:600, background:"#F8FAFC" },
  tr: { borderBottom:"1px solid #F1F5F9" },
  td: { padding:"10px 12px", color:"#1E293B" },
};
