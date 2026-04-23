"use client";
import React, { useEffect, useMemo, useState } from "react";

const TABS = [
  { key: "statements", label: "문항" },
  { key: "frames",     label: "프레임" },
  { key: "types",      label: "유형" },
];

const STATUS_META = {
  diff:      { bg: "#DBEAFE", fg: "#1E40AF", label: "수정됨" },
  new:       { bg: "#DCFCE7", fg: "#166534", label: "새 항목(dev에만)" },
  prod_only: { bg: "#FEF3C7", fg: "#92400E", label: "prod에만 있음" },
};

function valStr(v) {
  if (v === null || v === undefined) return "∅";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default function PublishPage() {
  const [tab, setTab] = useState("statements");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState(null);

  const load = () => {
    setLoading(true); setError(null); setApplyResult(null);
    fetch("/api/admin/publish/diff?type=" + tab)
      .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e)))
      .then(d => {
        setData(d); setLoading(false); setSelected(new Set());
      })
      .catch(e => { setError(e.error || "로드 실패"); setLoading(false); });
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

  const applicable = useMemo(
    () => (data?.rows || []).filter(r => r.status === "diff" || r.status === "new"),
    [data]
  );

  const allSelected = applicable.length > 0 && applicable.every(r => selected.has(r.key));

  const toggle = (key) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key); else next.add(key);
    setSelected(next);
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(applicable.map(r => r.key)));
  };

  const apply = async () => {
    if (selected.size === 0) return;
    const items = applicable.filter(r => selected.has(r.key)).map(r => r.idValues);
    const countMsg = `선택한 ${items.length}개 항목을 실서버(prod)에 반영합니다.\n\n되돌릴 수 없습니다. 계속하시겠습니까?`;
    if (!window.confirm(countMsg)) return;

    setApplying(true); setApplyResult(null);
    try {
      const res = await fetch("/api/admin/publish/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tab, items }),
      });
      const json = await res.json();
      setApplyResult(json);
      if (res.ok) {
        // 반영 후 새로 고침
        load();
      }
    } catch (e) {
      setApplyResult({ error: e.message || "반영 실패" });
    } finally {
      setApplying(false);
    }
  };

  if (data && data.enabled === false) {
    return (
      <div>
        <h1 style={S.title}>실서버 반영</h1>
        <div style={S.disabled}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>이 기능은 비활성화되어 있습니다.</div>
          <div style={{ fontSize: 13, color: "#64748B" }}>
            Vercel dev 환경에서만 사용 가능합니다.<br />
            환경변수 <code>PROD_SUPABASE_URL</code> / <code>PROD_SUPABASE_SERVICE_ROLE_KEY</code> 설정이 필요합니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={S.title}>실서버 반영 <span style={S.sub}>dev → prod</span></h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={S.tabBtn(tab === t.key)}>
            {t.label}
          </button>
        ))}
        <button onClick={load} style={S.reloadBtn} disabled={loading}>
          {loading ? "확인 중…" : "🔄 다시 비교"}
        </button>
      </div>

      {data && (
        <div style={S.summary}>
          총 {data.counts.total}건 차이 ·{" "}
          <span style={{ color: "#1E40AF" }}>수정 {data.counts.diff}</span> ·{" "}
          <span style={{ color: "#166534" }}>신규 {data.counts.new}</span>
          {data.counts.prod_only > 0 && (
            <> · <span style={{ color: "#92400E" }}>prod에만 {data.counts.prod_only}</span></>
          )}
        </div>
      )}

      {error && <div style={S.error}>오류: {error}</div>}

      {applyResult && (
        <div style={applyResult.success ? S.success : S.error}>
          {applyResult.success
            ? `반영 완료: 수정 ${applyResult.updated}건, 신규 ${applyResult.inserted}건`
            : `반영 실패: ${applyResult.error || (applyResult.failed && applyResult.failed.length + "건 실패")}`}
          {applyResult.failed && applyResult.failed.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 12 }}>
              {applyResult.failed.map((f, i) => (
                <div key={i}>· {JSON.stringify(f.item)} → {f.error}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {data && data.rows && data.rows.length === 0 && !loading && (
        <div style={S.empty}>dev 와 prod 가 완전히 동일합니다. ✨</div>
      )}

      {data && applicable.length > 0 && (
        <div style={S.actionBar}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#475569" }}>
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            <span>전체 선택 ({applicable.length}개)</span>
          </label>
          <button
            onClick={apply}
            disabled={selected.size === 0 || applying}
            style={S.applyBtn(selected.size === 0 || applying)}
          >
            {applying ? "반영 중…" : `선택한 ${selected.size}개 실서버 반영`}
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data && data.rows && data.rows.map(r => {
          const meta = STATUS_META[r.status] || { bg: "#F1F5F9", fg: "#475569", label: r.status };
          const isApplicable = r.status === "diff" || r.status === "new";
          return (
            <div key={r.key} style={S.card}>
              <div style={S.cardHead}>
                {isApplicable ? (
                  <input
                    type="checkbox"
                    checked={selected.has(r.key)}
                    onChange={() => toggle(r.key)}
                    style={{ marginRight: 4, cursor: "pointer" }}
                  />
                ) : (
                  <span style={{ width: 13, display: "inline-block" }} />
                )}
                <span style={{ ...S.statusBadge, background: meta.bg, color: meta.fg }}>{meta.label}</span>
                <span style={S.idLabel}>{r.label}</span>
              </div>

              {r.status === "diff" && (
                <div style={S.diffBox}>
                  {r.changed.map(c => (
                    <div key={c.field} style={S.diffRow}>
                      <div style={S.diffField}>{c.field}</div>
                      <div style={S.diffBefore}>prod: {valStr(c.from)}</div>
                      <div style={S.diffAfter}>dev: {valStr(c.to)}</div>
                    </div>
                  ))}
                </div>
              )}

              {r.status === "new" && (
                <div style={S.diffBox}>
                  {r.changed.map(c => (
                    <div key={c.field} style={{ ...S.diffRow, gridTemplateColumns: "120px 1fr" }}>
                      <div style={S.diffField}>{c.field}</div>
                      <div style={S.diffAfter}>{valStr(c.to)}</div>
                    </div>
                  ))}
                </div>
              )}

              {r.status === "prod_only" && (
                <div style={{ fontSize: 12, color: "#92400E", padding: "4px 0" }}>
                  prod 에만 존재. 자동 삭제는 지원하지 않습니다 (안전장치).
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const S = {
  title: { fontSize: 24, fontWeight: 700, color: "#1E293B", marginBottom: 24 },
  sub: { fontSize: 13, fontWeight: 400, color: "#94A3B8", marginLeft: 8 },
  tabBtn: (active) => ({
    padding: "8px 16px", borderRadius: 8,
    border: "1px solid " + (active ? "#3B82F6" : "#E2E8F0"),
    background: active ? "#3B82F6" : "#fff",
    color: active ? "#fff" : "#475569",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
  }),
  reloadBtn: {
    padding: "8px 14px", borderRadius: 8, border: "1px solid #E2E8F0",
    background: "#fff", color: "#475569", fontSize: 13, cursor: "pointer", marginLeft: "auto",
  },
  summary: { fontSize: 13, color: "#64748B", marginBottom: 16 },
  error:   { padding: 12, background: "#FEE2E2", color: "#991B1B", borderRadius: 8, marginBottom: 16, fontSize: 13 },
  success: { padding: 12, background: "#DCFCE7", color: "#166534", borderRadius: 8, marginBottom: 16, fontSize: 13 },
  empty:   { padding: 40, textAlign: "center", color: "#94A3B8", background: "#fff", borderRadius: 12 },
  disabled:{ padding: 32, background: "#fff", borderRadius: 12, border: "1px dashed #CBD5E1" },
  actionBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px", background: "#F8FAFC", borderRadius: 8, marginBottom: 12,
  },
  applyBtn: (disabled) => ({
    padding: "8px 16px", borderRadius: 8, border: "none",
    background: disabled ? "#CBD5E1" : "#EF4444",
    color: "#fff", fontSize: 13, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
  }),
  card: { background: "#fff", borderRadius: 10, padding: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  cardHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" },
  statusBadge: { fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 },
  idLabel: { fontSize: 14, fontWeight: 600, color: "#1E293B" },
  diffBox: { background: "#F8FAFC", borderRadius: 6, padding: 10, display: "flex", flexDirection: "column", gap: 8 },
  diffRow: { display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 2, columnGap: 10, alignItems: "start" },
  diffField: { fontSize: 12, fontWeight: 600, color: "#475569", gridRow: "1 / span 2" },
  diffBefore: { fontSize: 13, color: "#991B1B", background: "#FEF2F2", padding: "4px 8px", borderRadius: 4, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  diffAfter:  { fontSize: 13, color: "#166534", background: "#F0FDF4", padding: "4px 8px", borderRadius: 4, whiteSpace: "pre-wrap", wordBreak: "break-word" },
};
