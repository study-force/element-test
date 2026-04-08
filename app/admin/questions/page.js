"use client";
import React, { useState, useEffect, useCallback } from "react";

const MIXED_KEYS = ["이론실행", "경험실행", "이론사고", "경험사고"];
const AXIS_POLES = {
  θ1: ["이론", "경험"],
  θ2: ["실행", "사고"],
};
const KEY_COLORS = {
  이론실행: "#3B82F6", 경험실행: "#F59E0B", 이론사고: "#8B5CF6", 경험사고: "#06B6D4",
  이론: "#3B82F6", 경험: "#F59E0B", 실행: "#EF4444", 사고: "#8B5CF6",
};

const s = {
  title: { fontSize: 24, fontWeight: 700, color: "#1E293B", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#64748B", marginBottom: 28 },
  frame: { background: "#fff", borderRadius: 12, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" },
  frameHeader: (open) => ({
    display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px",
    cursor: "pointer", background: open ? "#F8FAFC" : "#fff", transition: "background 0.15s",
    borderBottom: open ? "1px solid #E2E8F0" : "none",
  }),
  frameTitle: { display: "flex", alignItems: "center", gap: 12 },
  frameBadge: (color) => ({
    fontSize: 11, padding: "2px 8px", borderRadius: 4, background: color || "#E2E8F0",
    color: "#fff", fontWeight: 600,
  }),
  frameTheme: { fontSize: 15, fontWeight: 600, color: "#1E293B" },
  frameCount: { fontSize: 12, color: "#94A3B8" },
  frameBody: { padding: "16px 20px" },
  editRow: { display: "flex", gap: 12, marginBottom: 16, alignItems: "center" },
  label: { fontSize: 12, color: "#64748B", fontWeight: 500, marginBottom: 4 },
  input: { padding: "8px 12px", fontSize: 14, border: "1px solid #D1D5DB", borderRadius: 8, outline: "none", flex: 1 },
  inputSm: { padding: "8px 12px", fontSize: 14, border: "1px solid #D1D5DB", borderRadius: 8, outline: "none", width: 140 },
  stmt: {
    display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0",
    borderBottom: "1px solid #F1F5F9",
  },
  stmtBadge: (color) => ({
    fontSize: 11, padding: "3px 8px", borderRadius: 4, background: color || "#94A3B8",
    color: "#fff", fontWeight: 600, whiteSpace: "nowrap", marginTop: 2, minWidth: 50, textAlign: "center",
  }),
  stmtText: { flex: 1, fontSize: 14, color: "#334155", lineHeight: 1.5 },
  textarea: { width: "100%", padding: "8px 12px", fontSize: 14, border: "1px solid #D1D5DB", borderRadius: 8, outline: "none", resize: "vertical", minHeight: 36, lineHeight: 1.5, boxSizing: "border-box" },
  btnRow: { display: "flex", gap: 8, marginTop: 4 },
  btn: (bg) => ({
    padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#fff",
    background: bg, border: "none", borderRadius: 6, cursor: "pointer",
  }),
  btnOutline: {
    padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#64748B",
    background: "transparent", border: "1px solid #D1D5DB", borderRadius: 6, cursor: "pointer",
  },
  orderBtns: { display: "flex", flexDirection: "column", gap: 2 },
  orderBtn: {
    width: 28, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
    background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 4, cursor: "pointer",
    fontSize: 11, color: "#64748B",
  },
  addStmt: {
    padding: "10px 0", textAlign: "center", color: "#3B82F6", fontSize: 13,
    cursor: "pointer", fontWeight: 500, borderTop: "1px dashed #E2E8F0", marginTop: 8,
  },
  toast: {
    position: "fixed", bottom: 24, right: 24, background: "#1E293B", color: "#fff",
    padding: "12px 20px", borderRadius: 8, fontSize: 14, zIndex: 1000,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  loading: { textAlign: "center", padding: 60, color: "#64748B", fontSize: 15 },
};

export default function QuestionsPage() {
  const [frames, setFrames] = useState([]);
  const [openFrame, setOpenFrame] = useState(null);
  const [editingStmt, setEditingStmt] = useState(null); // { id, text, key, pole }
  const [editingFrame, setEditingFrame] = useState(null); // { id, theme, dimension }
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const fetchFrames = useCallback(async () => {
    const res = await fetch("/api/admin/frames");
    if (res.ok) { setFrames(await res.json()); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchFrames(); }, [fetchFrames]);

  // 프레임 수정
  const saveFrame = async (frame) => {
    const res = await fetch(`/api/admin/frames/${frame.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: frame.theme, dimension: frame.dimension }),
    });
    if (res.ok) { showToast("프레임 저장 완료"); fetchFrames(); setEditingFrame(null); }
  };

  // 프레임 순서 변경
  const moveFrame = async (idx, dir) => {
    const arr = [...frames];
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= arr.length) return;
    [arr[idx], arr[targetIdx]] = [arr[targetIdx], arr[idx]];
    const order = arr.map((f, i) => ({ id: f.id, sort_order: i }));
    const res = await fetch("/api/admin/frames/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
    if (res.ok) { fetchFrames(); showToast("순서 변경 완료"); }
  };

  // 문항 수정
  const saveStmt = async () => {
    if (!editingStmt) return;
    const res = await fetch(`/api/admin/statements/${editingStmt.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editingStmt.text, key: editingStmt.key, pole: editingStmt.pole }),
    });
    if (res.ok) { showToast("문항 저장 완료"); fetchFrames(); setEditingStmt(null); }
  };

  // 문항 삭제
  const deleteStmt = async (id) => {
    if (!confirm("이 문항을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/admin/statements/${id}`, { method: "DELETE" });
    if (res.ok) { showToast("문항 삭제 완료"); fetchFrames(); }
  };

  // 문항 추가
  const addStmt = async (frameId, axisType) => {
    const defaultKey = axisType ? (AXIS_POLES[axisType]?.[0] + "_1") : "이론실행";
    const defaultPole = axisType ? AXIS_POLES[axisType]?.[0] : null;
    const frame = frames.find(f => f.frame_id === frameId);
    const maxOrder = frame?.stmts?.length || 0;
    const res = await fetch("/api/admin/statements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frame_id: frameId, key: defaultKey, pole: defaultPole, text: "새 문항", sort_order: maxOrder }),
    });
    if (res.ok) { showToast("문항 추가 완료"); fetchFrames(); }
  };

  if (loading) return <div style={s.loading}>문항 데이터 로딩 중...</div>;

  return (
    <div>
      <h1 style={s.title}>문항 관리</h1>
      <div style={s.subtitle}>총 {frames.length}개 프레임, {frames.reduce((a, f) => a + (f.stmts?.length || 0), 0)}개 문항</div>

      {frames.map((frame, idx) => {
        const isOpen = openFrame === frame.id;
        const isAxis = !!frame.axis_type;
        const badgeColor = isAxis ? "#EF4444" : "#3B82F6";
        const badgeText = isAxis ? `순수축 ${frame.axis_type}` : frame.dimension || "혼합";

        return (
          <div key={frame.id} style={s.frame}>
            <div style={s.frameHeader(isOpen)} onClick={() => setOpenFrame(isOpen ? null : frame.id)}>
              <div style={s.frameTitle}>
                <div style={s.orderBtns} onClick={e => e.stopPropagation()}>
                  <button style={s.orderBtn} onClick={() => moveFrame(idx, -1)}>▲</button>
                  <button style={s.orderBtn} onClick={() => moveFrame(idx, 1)}>▼</button>
                </div>
                <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 600 }}>F{frame.frame_id}</span>
                <span style={s.frameBadge(badgeColor)}>{badgeText}</span>
                <span style={s.frameTheme}>{frame.theme}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={s.frameCount}>{frame.stmts?.length || 0}개 문항</span>
                <span style={{ fontSize: 18, color: "#94A3B8" }}>{isOpen ? "▾" : "▸"}</span>
              </div>
            </div>

            {isOpen && (
              <div style={s.frameBody}>
                {/* 프레임 편집 */}
                {editingFrame?.id === frame.id ? (
                  <div style={s.editRow}>
                    <div style={{ flex: 1 }}>
                      <div style={s.label}>테마</div>
                      <input style={s.input} value={editingFrame.theme} onChange={e => setEditingFrame(p => ({ ...p, theme: e.target.value }))} />
                    </div>
                    {!isAxis && (
                      <div>
                        <div style={s.label}>차원</div>
                        <input style={s.inputSm} value={editingFrame.dimension || ""} onChange={e => setEditingFrame(p => ({ ...p, dimension: e.target.value }))} />
                      </div>
                    )}
                    <div style={{ ...s.btnRow, marginTop: 18 }}>
                      <button style={s.btn("#3B82F6")} onClick={() => saveFrame(editingFrame)}>저장</button>
                      <button style={s.btnOutline} onClick={() => setEditingFrame(null)}>취소</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ ...s.editRow, marginBottom: 20 }}>
                    <span style={{ fontSize: 13, color: "#64748B" }}>테마: <b>{frame.theme}</b></span>
                    {!isAxis && <span style={{ fontSize: 13, color: "#94A3B8" }}>차원: {frame.dimension || "-"}</span>}
                    <button style={s.btnOutline} onClick={() => setEditingFrame({ id: frame.id, theme: frame.theme, dimension: frame.dimension })}>편집</button>
                  </div>
                )}

                {/* 문항 목록 */}
                {(frame.stmts || []).map(stmt => {
                  const isEditing = editingStmt?.id === stmt.id;
                  const poleOrKey = stmt.pole || stmt.key;
                  const badgeCol = KEY_COLORS[poleOrKey] || KEY_COLORS[stmt.key] || "#94A3B8";

                  if (isEditing) {
                    return (
                      <div key={stmt.id} style={{ ...s.stmt, flexDirection: "column", gap: 10 }}>
                        <div style={{ display: "flex", gap: 10, width: "100%", alignItems: "center" }}>
                          <div>
                            <div style={s.label}>키</div>
                            {isAxis ? (
                              <input style={s.inputSm} value={editingStmt.key} onChange={e => setEditingStmt(p => ({ ...p, key: e.target.value }))} />
                            ) : (
                              <select style={s.inputSm} value={editingStmt.key} onChange={e => setEditingStmt(p => ({ ...p, key: e.target.value }))}>
                                {MIXED_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                              </select>
                            )}
                          </div>
                          {isAxis && (
                            <div>
                              <div style={s.label}>극성</div>
                              <select style={s.inputSm} value={editingStmt.pole || ""} onChange={e => setEditingStmt(p => ({ ...p, pole: e.target.value }))}>
                                {AXIS_POLES[frame.axis_type]?.map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                            </div>
                          )}
                        </div>
                        <div style={{ width: "100%" }}>
                          <div style={s.label}>문항 텍스트</div>
                          <textarea style={s.textarea} value={editingStmt.text} onChange={e => setEditingStmt(p => ({ ...p, text: e.target.value }))} />
                        </div>
                        <div style={s.btnRow}>
                          <button style={s.btn("#3B82F6")} onClick={saveStmt}>저장</button>
                          <button style={s.btnOutline} onClick={() => setEditingStmt(null)}>취소</button>
                          <button style={s.btn("#EF4444")} onClick={() => deleteStmt(stmt.id)}>삭제</button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={stmt.id} style={s.stmt}>
                      <span style={s.stmtBadge(badgeCol)}>{poleOrKey}</span>
                      <span style={s.stmtText}>{stmt.text}</span>
                      <button style={s.btnOutline} onClick={() => setEditingStmt({ id: stmt.id, text: stmt.text, key: stmt.key, pole: stmt.pole })}>
                        편집
                      </button>
                    </div>
                  );
                })}

                <div style={s.addStmt} onClick={() => addStmt(frame.frame_id, frame.axis_type)}>
                  + 문항 추가
                </div>
              </div>
            )}
          </div>
        );
      })}

      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
}
