"use client";
import React, { useState, useEffect, useCallback } from "react";

const s = {
  title: { fontSize: 24, fontWeight: 700, color: "#1E293B", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#64748B", marginBottom: 28 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 },
  card: (bg, accent, active) => ({
    background: bg || "#fff", borderRadius: 14, padding: "20px 24px",
    border: active ? `2px solid ${accent || "#3B82F6"}` : "2px solid transparent",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)", cursor: "pointer", transition: "border 0.15s",
  }),
  cardEmoji: { fontSize: 32, marginBottom: 8 },
  cardName: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  cardType: { fontSize: 13, color: "#64748B", marginBottom: 2 },
  cardSlogan: { fontSize: 13, fontStyle: "italic", color: "#94A3B8" },
  colorDot: (c) => ({ display: "inline-block", width: 14, height: 14, borderRadius: "50%", background: c, marginRight: 6, verticalAlign: "middle" }),
  editor: { background: "#fff", borderRadius: 14, padding: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: 24 },
  editorTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8, borderBottom: "1px solid #F1F5F9", paddingBottom: 4 },
  row: { display: "flex", gap: 12, marginBottom: 10, alignItems: "center" },
  label: { fontSize: 12, color: "#64748B", fontWeight: 500, width: 80, flexShrink: 0 },
  input: { padding: "8px 12px", fontSize: 14, border: "1px solid #D1D5DB", borderRadius: 8, outline: "none", flex: 1 },
  textarea: { width: "100%", padding: "8px 12px", fontSize: 14, border: "1px solid #D1D5DB", borderRadius: 8, outline: "none", resize: "vertical", minHeight: 80, lineHeight: 1.6, boxSizing: "border-box" },
  listItem: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  listInput: { padding: "6px 10px", fontSize: 13, border: "1px solid #D1D5DB", borderRadius: 6, outline: "none", flex: 1 },
  listBtn: (bg) => ({
    padding: "4px 10px", fontSize: 11, fontWeight: 600, color: "#fff",
    background: bg, border: "none", borderRadius: 4, cursor: "pointer",
  }),
  btnRow: { display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" },
  saveBtn: {
    padding: "10px 28px", fontSize: 14, fontWeight: 600, color: "#fff",
    background: "#3B82F6", border: "none", borderRadius: 8, cursor: "pointer",
  },
  cancelBtn: {
    padding: "10px 28px", fontSize: 14, fontWeight: 600, color: "#64748B",
    background: "transparent", border: "1px solid #D1D5DB", borderRadius: 8, cursor: "pointer",
  },
  toast: {
    position: "fixed", bottom: 24, right: 24, background: "#1E293B", color: "#fff",
    padding: "12px 20px", borderRadius: 8, fontSize: 14, zIndex: 1000,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  loading: { textAlign: "center", padding: 60, color: "#64748B", fontSize: 15 },
};

export default function TypesPage() {
  const [types, setTypes] = useState([]);
  const [selected, setSelected] = useState(null); // key
  const [form, setForm] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const fetchTypes = useCallback(async () => {
    const res = await fetch("/api/admin/types");
    if (res.ok) setTypes(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchTypes(); }, [fetchTypes]);

  const selectType = (t) => {
    setSelected(t.key);
    setForm({ ...t });
  };

  const updateField = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const updateListItem = (field, index, value) => {
    setForm(p => {
      const arr = [...(p[field] || [])];
      arr[index] = value;
      return { ...p, [field]: arr };
    });
  };
  const addListItem = (field) => setForm(p => ({ ...p, [field]: [...(p[field] || []), ""] }));
  const removeListItem = (field, index) => {
    setForm(p => ({ ...p, [field]: (p[field] || []).filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    const res = await fetch(`/api/admin/types/${encodeURIComponent(form.key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { showToast("유형 저장 완료"); fetchTypes(); }
    else { showToast("저장 실패"); }
  };

  if (loading) return <div style={s.loading}>유형 데이터 로딩 중...</div>;

  return (
    <div>
      <h1 style={s.title}>유형 관리</h1>
      <div style={s.subtitle}>4가지 원소 유형의 설명, 강점/약점, 색상 등을 편집합니다</div>

      <div style={s.grid}>
        {types.map(t => (
          <div key={t.key} style={s.card(t.bg, t.accent, selected === t.key)} onClick={() => selectType(t)}>
            <div style={s.cardEmoji}>{t.emoji}</div>
            <div style={s.cardName}>{t.char_name}</div>
            <div style={s.cardType}>{t.type_name} ({t.key})</div>
            <div style={s.cardSlogan}>{t.slogan}</div>
            <div style={{ marginTop: 8 }}>
              <span style={s.colorDot(t.color)} />
              <span style={s.colorDot(t.bg)} />
              <span style={s.colorDot(t.accent)} />
            </div>
          </div>
        ))}
      </div>

      {form && (
        <div style={s.editor}>
          <div style={s.editorTitle}>
            <span style={{ fontSize: 28 }}>{form.emoji}</span>
            <span>{form.char_name} 편집</span>
          </div>

          {/* 기본 정보 */}
          <div style={s.section}>
            <div style={s.sectionLabel}>기본 정보</div>
            {[
              ["emoji", "이모지"], ["char_name", "캐릭터명"], ["type_name", "유형명"],
              ["slogan", "슬로건"], ["subtitle", "부제"], ["body_question", "바디 질문"],
            ].map(([field, label]) => (
              <div key={field} style={s.row}>
                <span style={s.label}>{label}</span>
                <input style={s.input} value={form[field] || ""} onChange={e => updateField(field, e.target.value)} />
              </div>
            ))}
          </div>

          {/* 색상 */}
          <div style={s.section}>
            <div style={s.sectionLabel}>색상</div>
            {[["color", "메인 색상"], ["bg", "배경 색상"], ["accent", "강조 색상"]].map(([field, label]) => (
              <div key={field} style={s.row}>
                <span style={s.label}>{label}</span>
                <span style={s.colorDot(form[field])} />
                <input style={{ ...s.input, maxWidth: 140 }} value={form[field] || ""} onChange={e => updateField(field, e.target.value)} />
              </div>
            ))}
          </div>

          {/* 강점 / 약점 */}
          {[["strengths", "강점"], ["weaknesses", "약점"]].map(([field, label]) => (
            <div key={field} style={s.section}>
              <div style={s.sectionLabel}>{label}</div>
              {(form[field] || []).map((item, i) => (
                <div key={i} style={s.listItem}>
                  <input style={s.listInput} value={item} onChange={e => updateListItem(field, i, e.target.value)} />
                  <button style={s.listBtn("#EF4444")} onClick={() => removeListItem(field, i)}>삭제</button>
                </div>
              ))}
              <button style={s.listBtn("#3B82F6")} onClick={() => addListItem(field)}>+ 추가</button>
            </div>
          ))}

          {/* 설명 텍스트 */}
          <div style={s.section}>
            <div style={s.sectionLabel}>설명 텍스트</div>
            {[
              ["description_what", "나는 어떤 학습자인가"],
              ["description_how", "나에게 맞는 공부법"],
              ["description_caution", "조심해야 할 공부 습관"],
              ["tq_desc", "TQ 안내 (짧은)"],
              ["tq_detail", "TQ 안내 (상세)"],
            ].map(([field, label]) => (
              <div key={field} style={{ marginBottom: 14 }}>
                <div style={{ ...s.label, width: "auto", marginBottom: 4 }}>{label}</div>
                <textarea style={s.textarea} value={form[field] || ""} onChange={e => updateField(field, e.target.value)} />
              </div>
            ))}
          </div>

          <div style={s.btnRow}>
            <button style={s.cancelBtn} onClick={() => { setSelected(null); setForm(null); }}>취소</button>
            <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      )}

      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
}
