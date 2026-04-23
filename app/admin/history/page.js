"use client";
import React, { useEffect, useMemo, useState } from "react";

const TABS = [
  { key: "statements", label: "문항" },
  { key: "frames",     label: "프레임" },
  { key: "types",      label: "유형" },
];

const OP_COLOR = {
  INSERT: { bg: "#DCFCE7", fg: "#166534", label: "생성" },
  UPDATE: { bg: "#DBEAFE", fg: "#1E40AF", label: "수정" },
  DELETE: { bg: "#FEE2E2", fg: "#991B1B", label: "삭제" },
};

// 항목별로 관심있는 필드
const FIELDS = {
  statements: ["frame_id", "key", "pole", "text", "sort_order"],
  frames:     ["frame_id", "theme", "dimension", "axis_type", "sort_order"],
  types:      ["key", "type_name", "emoji", "slogan", "subtitle",
               "description_what", "description_how", "description_caution",
               "color", "bg", "accent", "sort_order"],
};

function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function valStr(v) {
  if (v === null || v === undefined) return "∅";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default function HistoryPage() {
  const [tab, setTab] = useState("statements");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterFrame, setFilterFrame] = useState("");
  const [filterKey, setFilterKey] = useState("");

  useEffect(() => {
    setLoading(true); setError(null);
    const p = new URLSearchParams();
    p.set("type", tab);
    p.set("limit", "300");
    if (filterFrame) p.set("frame_id", filterFrame);
    if (filterKey)   p.set("key", filterKey);
    fetch("/api/admin/history?" + p.toString())
      .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e)))
      .then(d => { setRows(d.rows || []); setLoading(false); })
      .catch(e => { setError(e.error || "로드 실패"); setLoading(false); });
  }, [tab, filterFrame, filterKey]);

  // 같은 항목(= 같은 식별키) 내에서 이전 스냅샷과 비교해서 변경된 필드만 추려냄
  const diffRows = useMemo(() => {
    const fields = FIELDS[tab];
    // 식별키: statements=frame_id::key, frames=frame_id, types=key
    const idOf = (r) => {
      if (tab === "statements") return `${r.frame_id}::${r.key}`;
      if (tab === "frames")     return r.frame_id;
      return r.key;
    };
    // rows 는 최신순. 그룹별로 바로 다음(= 시간상 이전)을 "이전 값"으로 연결
    const nextSeen = new Map();
    // 오래된 것부터 훑어야 "이전"을 쉽게 알 수 있음 → 역순으로 돌리며 prev 저장
    const asc = [...rows].reverse();
    const prevMap = new Map(); // historyId → prev row
    const lastByGroup = new Map();
    for (const r of asc) {
      const k = idOf(r);
      if (lastByGroup.has(k)) prevMap.set(r.history_id, lastByGroup.get(k));
      lastByGroup.set(k, r);
    }
    return rows.map(r => {
      const prev = prevMap.get(r.history_id) || null;
      const changed = [];
      if (r.op === "UPDATE" && prev) {
        for (const f of fields) {
          const a = prev[f], b = r[f];
          if (JSON.stringify(a) !== JSON.stringify(b)) changed.push({ field: f, from: a, to: b });
        }
      }
      return { row: r, prev, changed };
    });
  }, [rows, tab]);

  return (
    <div>
      <h1 style={S.title}>변경 이력</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={S.tabBtn(tab === t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        {(tab === "statements" || tab === "frames") && (
          <input
            type="text" placeholder="frame_id 필터 (예: F01)"
            value={filterFrame} onChange={e => setFilterFrame(e.target.value.trim())}
            style={S.input}
          />
        )}
        {tab === "statements" && (
          <input
            type="text" placeholder="문항 key 필터 (예: 이론실행)"
            value={filterKey} onChange={e => setFilterKey(e.target.value.trim())}
            style={S.input}
          />
        )}
        {tab === "types" && (
          <input
            type="text" placeholder="type key 필터 (예: 이론실행)"
            value={filterKey} onChange={e => setFilterKey(e.target.value.trim())}
            style={S.input}
          />
        )}
        {(filterFrame || filterKey) && (
          <button onClick={() => { setFilterFrame(""); setFilterKey(""); }} style={S.clearBtn}>필터 해제</button>
        )}
        <span style={{ fontSize: 12, color: "#94A3B8" }}>
          {loading ? "로딩 중…" : `총 ${rows.length.toLocaleString()}건 (최신 300건)`}
        </span>
      </div>

      {error && <div style={S.error}>오류: {error}</div>}

      {!loading && rows.length === 0 && !error && (
        <div style={S.empty}>
          이력이 없습니다. (SQL 적용 직후라면 아직 변경이 발생하지 않았을 수 있습니다.)
        </div>
      )}

      <div style={S.list}>
        {diffRows.map(({ row: r, prev, changed }) => {
          const op = OP_COLOR[r.op] || { bg: "#F1F5F9", fg: "#475569", label: r.op };
          const idLabel =
            tab === "statements" ? `${r.frame_id} · ${r.key}` :
            tab === "frames"     ? `${r.frame_id}` :
            `${r.key}`;
          return (
            <div key={r.history_id} style={S.card}>
              <div style={S.cardHead}>
                <span style={{ ...S.opBadge, background: op.bg, color: op.fg }}>{op.label}</span>
                <span style={S.idLabel}>{idLabel}</span>
                <span style={S.time}>{fmtTime(r.changed_at)}</span>
              </div>

              {r.op === "UPDATE" && changed.length > 0 && (
                <div style={S.diffBox}>
                  {changed.map(c => (
                    <div key={c.field} style={S.diffRow}>
                      <div style={S.diffField}>{c.field}</div>
                      <div style={S.diffBefore}>- {valStr(c.from)}</div>
                      <div style={S.diffAfter}>+ {valStr(c.to)}</div>
                    </div>
                  ))}
                </div>
              )}

              {r.op === "UPDATE" && changed.length === 0 && prev && (
                <div style={{ fontSize: 12, color: "#94A3B8", padding: "8px 0" }}>
                  (표시 필드에 변경 없음 — 트리거는 실행됨)
                </div>
              )}

              {r.op !== "UPDATE" && (
                <div style={S.snapshotBox}>
                  {FIELDS[tab].map(f => (
                    <div key={f} style={S.snapRow}>
                      <span style={S.snapField}>{f}</span>
                      <span style={S.snapVal}>{valStr(r[f])}</span>
                    </div>
                  ))}
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
  tabBtn: (active) => ({
    padding: "8px 16px", borderRadius: 8,
    border: "1px solid " + (active ? "#3B82F6" : "#E2E8F0"),
    background: active ? "#3B82F6" : "#fff",
    color: active ? "#fff" : "#475569",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
  }),
  input: {
    padding: "6px 10px", border: "1px solid #E2E8F0", borderRadius: 6,
    fontSize: 13, color: "#1E293B", width: 200,
  },
  clearBtn: {
    padding: "6px 10px", border: "1px solid #E2E8F0", borderRadius: 6,
    background: "#fff", color: "#64748B", cursor: "pointer", fontSize: 12,
  },
  error: { padding: 16, background: "#FEE2E2", color: "#991B1B", borderRadius: 8, marginBottom: 16 },
  empty: { padding: 40, textAlign: "center", color: "#94A3B8", background: "#fff", borderRadius: 12 },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: { background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  cardHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" },
  opBadge: { fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 },
  idLabel: { fontSize: 14, fontWeight: 600, color: "#1E293B" },
  time: { fontSize: 12, color: "#94A3B8", marginLeft: "auto" },
  diffBox: { background: "#F8FAFC", borderRadius: 6, padding: 10, display: "flex", flexDirection: "column", gap: 8 },
  diffRow: { display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 2, columnGap: 10, alignItems: "start" },
  diffField: { fontSize: 12, fontWeight: 600, color: "#475569", gridRow: "1 / span 2" },
  diffBefore: { fontSize: 13, color: "#991B1B", background: "#FEF2F2", padding: "4px 8px", borderRadius: 4, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  diffAfter: { fontSize: 13, color: "#166534", background: "#F0FDF4", padding: "4px 8px", borderRadius: 4, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  snapshotBox: { background: "#F8FAFC", borderRadius: 6, padding: 10, display: "flex", flexDirection: "column", gap: 4 },
  snapRow: { display: "flex", gap: 12, fontSize: 12 },
  snapField: { color: "#64748B", width: 120, flexShrink: 0 },
  snapVal: { color: "#1E293B", whiteSpace: "pre-wrap", wordBreak: "break-word" },
};
