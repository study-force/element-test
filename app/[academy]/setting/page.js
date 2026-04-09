"use client";
import { useState, useEffect, use } from "react";

export default function SettingPage({ params }) {
  const { academy } = use(params);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // 학원 정보 로드
  useEffect(() => {
    fetch(`/api/academy/${encodeURIComponent(academy)}`)
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then(data => { setName(data.name || ""); setTel(data.tel || ""); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [academy]);

  const handleAuth = async () => {
    setError("");
    // 비밀번호 검증은 PUT 요청 시 서버에서 처리
    // 여기서는 비밀번호를 저장해두고 저장 시 함께 전송
    setAuthed(true);
  };

  const handleSave = async () => {
    setError(""); setSaved(false);
    try {
      const res = await fetch(`/api/academy/${encodeURIComponent(academy)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, name: name.trim(), tel: tel.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setAuthed(false); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e.message); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
      <p style={{ color: "#94A3B8" }}>로딩 중...</p>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 48, marginBottom: 8 }}>🔍</p>
        <p style={{ fontSize: 16, color: "#1E293B", fontWeight: 600 }}>등록되지 않은 학원입니다.</p>
        <p style={{ fontSize: 13, color: "#94A3B8" }}>본사에 문의해 주세요.</p>
      </div>
    </div>
  );

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>센터 정보 설정</h1>
        <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 32 }}>{academy}</p>

        {!authed ? (
          <>
            <label style={labelStyle}>비밀번호</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="학원 비밀번호 입력" style={inputStyle}
              onKeyDown={e => e.key === "Enter" && handleAuth()} />
            <button onClick={handleAuth} disabled={!password} style={btnStyle}>확인</button>
          </>
        ) : (
          <>
            <label style={labelStyle}>센터명</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="예: 스터디포스 분당센터" style={inputStyle} />

            <label style={labelStyle}>전화번호</label>
            <input value={tel} onChange={e => setTel(e.target.value)}
              placeholder="예: 031-719-1300" style={inputStyle} />

            {/* 실시간 미리보기 */}
            <div style={{ marginBottom: 20, padding: 20, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12 }}>
              <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginBottom: 12, letterSpacing: 1 }}>미리보기 — 학생에게 보이는 화면</p>
              <div style={{ background: "#fff", borderRadius: 8, padding: "24px 16px", textAlign: "center", border: "1px solid #F1F5F9" }}>
                <p style={{ fontSize: 14, color: "#444", lineHeight: 2.2, margin: "0 0 20px", whiteSpace: "pre-line" }}>
                  {`본 검사는 스터디포스 ${name || "제휴센터"}에서\n받아보실 수 있습니다.`}
                </p>
                <p style={{ fontSize: 15, color: "#1A1A1A", fontWeight: 600, margin: "0 0 20px" }}>
                  예약하시겠습니까?
                </p>
                <span style={{
                  display: "inline-block", fontSize: 13, fontWeight: 600, color: "#fff",
                  padding: "10px 24px", borderRadius: 8, background: tel ? "#1A1A1A" : "#CBD5E1",
                }}>
                  {tel ? `예약하기 → ${tel}` : "예약하기 → (전화번호 미입력)"}
                </span>
              </div>
            </div>

            <button onClick={handleSave} style={btnStyle}>저장</button>

            {saved && (
              <div style={{ marginTop: 16, padding: 12, background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 8 }}>
                <p style={{ fontSize: 13, color: "#166534", margin: "0 0 6px", fontWeight: 600 }}>저장 완료!</p>
                <p style={{ fontSize: 11, color: "#166534", margin: 0 }}>배포 주소: {baseUrl}/{academy}</p>
              </div>
            )}

            {name && tel && (
              <div style={{ marginTop: 24, padding: 16, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8 }}>
                <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 8px" }}>학생/학부모 배포용 링크</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#1E293B", margin: "0 0 12px", wordBreak: "break-all" }}>{baseUrl}/{academy}</p>
                <button onClick={() => { navigator.clipboard?.writeText(`${baseUrl}/${academy}`); }}
                  style={{ ...btnStyle, background: "#059669", fontSize: 12, padding: "8px 16px" }}>
                  링크 복사
                </button>
              </div>
            )}
          </>
        )}

        {error && (
          <div style={{ marginTop: 16, padding: 12, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8 }}>
            <p style={{ fontSize: 13, color: "#DC2626", margin: 0 }}>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 };
const inputStyle = { width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #D1D5DB", borderRadius: 8, marginBottom: 16, outline: "none", boxSizing: "border-box" };
const btnStyle = { width: "100%", padding: "12px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#1E293B", border: "none", borderRadius: 8, cursor: "pointer" };
