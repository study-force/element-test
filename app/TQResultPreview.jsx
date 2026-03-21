"use client";
import React, { useState, useEffect, useRef } from "react";

// ── 5개 Case 데이터 ──
const CASES = [
  {
    id: 1,
    title: "성실한 암기형",
    badge: "전형적 중상위권",
    subtitle: "암기 중심 인지 관성 교정 필요",
    accuracy: 60,
    speed: 157,
    radar: { 어휘능력: 60, 워킹메모리: 50, 추론능력: 60, 독해습관: 50, 독해효율성: 20 },
    insight:
      "전형적인 중상위권 학생들에게 나타나는 유형으로, 성실한 태도를 갖췄으나 정보의 '이해'보다 '기억'에 의존합니다. 고난도 비문학 추론 과제에서 점수 정체가 발생할 확률이 높습니다.",
  },
  {
    id: 2,
    title: "논리 분석 특화형",
    badge: "이공계 유망",
    subtitle: "수리·과학 분야의 높은 적응성 예상",
    accuracy: 80,
    speed: 792,
    radar: { 어휘능력: 50, 워킹메모리: 70, 추론능력: 90, 독해습관: 80, 독해효율성: 80 },
    insight:
      "문자 정보의 구조적 이해도가 높고 추론 능력이 우수합니다. 방대한 양의 복합 정보를 효율적으로 분류하고 처리하는 데 강점을 보이며, 이공계 심화 학습 시 두각을 나타낼 것으로 분석됩니다.",
  },
  {
    id: 3,
    title: "논리적 사고 결함형",
    badge: "수리 약점",
    subtitle: "논리 사고 결함으로 수리 학습 고전 예상",
    accuracy: 50,
    speed: 1048,
    radar: { 어휘능력: 60, 워킹메모리: 40, 추론능력: 10, 독해습관: 40, 독해효율성: 50 },
    insight:
      "정보들 사이의 인과관계를 찾는 결합 능력이 부족합니다. 수학에서 활용 문제나 서술형 문제해결에 큰 어려움이 예상되며, 논리적 사고에 취약하여 학년이 높아질수록 암기식 공부를 하게 됩니다.",
  },
  {
    id: 4,
    title: "심각한 학습력 결핍형",
    badge: "학습 불가",
    subtitle: "학습역량 한계로 인한 기초 역량 구축 시급",
    accuracy: 20,
    speed: 543,
    radar: { 어휘능력: 20, 워킹메모리: 30, 추론능력: 40, 독해습관: 20, 독해효율성: 10 },
    insight:
      "눈은 글을 읽고 있으나 뇌로 전달되는 과정에서 심각한 누수가 발생합니다. 현재 상태로는 어떤 지식을 넣어도 성과가 나지 않습니다. 독해 관성을 바로잡는 역량 강화 훈련이 최우선입니다.",
  },
  {
    id: 5,
    title: "최상위 잠재 역량형",
    badge: "특목·자사 권장",
    subtitle: "고난도 역량 습득 시 입시 절대 상위권 예상",
    accuracy: 90,
    speed: 1039,
    radar: { 어휘능력: 90, 워킹메모리: 60, 추론능력: 80, 독해습관: 100, 독해효율성: 90 },
    insight:
      "압도적인 정보 수용량과 처리 속도를 보유한 영재급 지표입니다. 올바른 비문학 전략과 고급 인지 습관을 장착한다면 특목고나 자사고 진학 시 최상위권을 유지할 핵심 엔진을 갖춘 상태입니다.",
  },
];

// ── SVG 원그래프형 레이더 차트 (Polar Area Chart) ──
const AXES = ["어휘능력", "워킹메모리", "추론능력", "독해습관", "독해효율성"];
const CX = 150, CY = 150, R = 110; // legacy (unused)
const CX2 = 170, CY2 = 170, R2 = 120;
const ANGLE_OFFSET = -Math.PI / 5; // 36도 반시계 회전 → 어휘능력이 12시 정중앙
const SECTOR_COLORS = [
  "#8b5cf673",  // 어휘능력 - 보라
  "#0ea5e973",  // 워킹메모리 - 청록
  "#64748b73",  // 추론능력 - 슬레이트
  "#84cc1673",  // 독해습관 - 라임
  "#22c55e73",  // 독해효율성 - 에메랄드
];
// 점수 구간 배경 (20~40, 60~80 구간에 옅은 회색 띠)
const BAND_RINGS = [
  { inner: 20, outer: 40, fill: "rgba(255,255,255,0.035)" },
  { inner: 60, outer: 80, fill: "rgba(255,255,255,0.035)" },
];
// 수치 라벨 색상 (부채꼴 색상의 불투명 버전)
const LABEL_COLORS = [
  "#a78bfa",  // 보라
  "#38bdf8",  // 청록
  "#94a3b8",  // 슬레이트
  "#a3e635",  // 라임
  "#4ade80",  // 에메랄드
];

function sectorPathData(index, value) {
  const anglePerSector = (Math.PI * 2) / 5;
  const startAngle = anglePerSector * index - Math.PI / 2 + ANGLE_OFFSET;
  const endAngle = startAngle + anglePerSector;
  const r = (value / 100) * R2;
  const x1 = CX2 + r * Math.cos(startAngle);
  const y1 = CY2 + r * Math.sin(startAngle);
  const x2 = CX2 + r * Math.cos(endAngle);
  const y2 = CY2 + r * Math.sin(endAngle);
  return `M${CX2},${CY2} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`;
}


function RadarChart({ data, animKey }) {
  return (
    <svg viewBox="0 0 340 340" style={{ width: "100%", maxWidth: 280 }}>
      {/* 점수 구간 배경 띠 (20~40, 60~80) */}
      {BAND_RINGS.map((b, idx) => {
        const ri = (b.inner / 100) * R2;
        const ro = (b.outer / 100) * R2;
        return (
          <path key={idx} d={`M${CX2-ro},${CY2} A${ro},${ro} 0 1,1 ${CX2+ro},${CY2} A${ro},${ro} 0 1,1 ${CX2-ro},${CY2} M${CX2-ri},${CY2} A${ri},${ri} 0 1,0 ${CX2+ri},${CY2} A${ri},${ri} 0 1,0 ${CX2-ri},${CY2}`} fill={b.fill} fillRule="evenodd" />
        );
      })}
      {/* 동심원 그리드 */}
      {[20, 40, 60, 80, 100].map((lv) => (
        <circle key={lv} cx={CX2} cy={CY2} r={(lv / 100) * R2} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      ))}
      {/* 축선 (5등분) */}
      {AXES.map((_, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2 + ANGLE_OFFSET;
        const x = CX2 + R2 * Math.cos(angle);
        const y = CY2 + R2 * Math.sin(angle);
        return <line key={i} x1={CX2} y1={CY2} x2={x} y2={y} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />;
      })}
      {/* 데이터 부채꼴 (그려지는 애니메이션) */}
      <g key={animKey} style={{ transformOrigin: `${CX2}px ${CY2}px`, animation: "radarGrow 0.6s ease-out" }}>
        {AXES.map((key, i) => (
          <path key={key} d={sectorPathData(i, data[key])} fill={SECTOR_COLORS[i]} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        ))}
      </g>
      {/* 중심점 */}
      <circle cx={CX2} cy={CY2} r={3.5} fill="#fff" />
      {/* 축 라벨 + 수치 */}
      {AXES.map((key, i) => {
        const angle = (Math.PI * 2 * i) / 5 + (Math.PI * 2) / 10 - Math.PI / 2 + ANGLE_OFFSET;
        const labelR = R2 + 28;
        const x = CX2 + labelR * Math.cos(angle);
        const y = CY2 + labelR * Math.sin(angle);
        const val = data[key];
        return (
          <g key={key}>
            <text x={x} y={y - 6} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10">{key}</text>
            <text x={x} y={y + 14} textAnchor="middle" fill={LABEL_COLORS[i]} fontSize="22" fontWeight="700">{val}</text>
          </g>
        );
      })}
      <style>{`@keyframes radarGrow { from { transform: scale(0); } to { transform: scale(1); } }`}</style>
    </svg>
  );
}

// ── 메인 컴포넌트 ──
export default function TQResultPreview() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fading, setFading] = useState(false);
  const timerRef = useRef(null);
  const pendingRef = useRef(null);

  // fade 전환: 먼저 fade-out → active 변경 → fade-in
  const transitionTo = (next) => {
    setFading(true);
    setTimeout(() => {
      setActive(next);
      setFading(false);
    }, 300);
  };

  // 자동 플레이: 4초마다 다음 Case로 전환
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      pendingRef.current = null;
      transitionTo((active + 1) % CASES.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [paused, active]);

  // 수동 탭 클릭 시 5초 후 자동 재개
  const handleTab = (i) => {
    transitionTo(i);
    setPaused(true);
    clearTimeout(pendingRef.current);
    pendingRef.current = setTimeout(() => setPaused(false), 5000);
  };

  const c = CASES[active];

  return (
    <div style={{ margin: "32px 0 0", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1025 0%, #0f172a 100%)", padding: "28px 20px 0", textAlign: "center" }}>
        <p style={{ color: "#c4b5fd", fontSize: 13, margin: "0 0 6px", letterSpacing: "2px" }}>TQ TEST</p>
        <p style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: "0 0 20px", lineHeight: 1.5 }}>
          이번엔 진짜 공부 실력인,<br />당신의 독해력을 확인해보세요.
        </p>
      </div>
      <div style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e1b3a 100%)", padding: "0 16px 24px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 4, padding: "12px 0 16px", flexWrap: "wrap" }}>
          {CASES.map((cs, i) => (
            <button
              key={cs.id}
              onClick={() => handleTab(i)}
              style={{
                background: "transparent", border: "none",
                color: active === i ? "#c084fc" : "rgba(255,255,255,0.4)",
                fontSize: 12, fontWeight: active === i ? 700 : 400,
                cursor: "pointer", padding: "4px 8px",
                borderBottom: active === i ? "2px solid #c084fc" : "2px solid transparent",
              }}
            >
              Case #{cs.id}
            </button>
          ))}
        </div>
        <div style={{ opacity: fading ? 0 : 1, transition: "opacity 0.3s ease-in-out" }}>
          <div style={{ padding: "0 4px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <span style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{c.title}</span>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>({c.badge})</span>
            </div>
            <p style={{ color: "#c084fc", fontSize: 12, margin: "4px 0 0", fontWeight: 600 }}>{c.subtitle}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <RadarChart data={c.radar} animKey={active} />
          </div>
          {/* 독해 정확도 / 속도 — 좌우 배치 */}
          <div style={{ display: "flex", gap: 0, width: "100%", margin: "8px 0 12px" }}>
            <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.1)", padding: "8px 0" }}>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>독해 정확도</span>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2, marginTop: 4 }}>
                <span style={{ color: "#fff", fontSize: 36, fontWeight: 800 }}>{c.accuracy}</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>%</span>
              </div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "8px 0" }}>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>독해 속도</span>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginTop: 4 }}>
                <span style={{ color: "#fff", fontSize: 36, fontWeight: 800 }}>{c.speed.toLocaleString()}</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>자/분</span>
              </div>
            </div>
          </div>
          {/* Core Insight */}
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px" }}>
            <span style={{ color: "#c084fc", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Core Insight</span>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 1.7, margin: "10px 0 0" }}>{c.insight}</p>
          </div>
        </div>
        <a
          href="https://mother.sfcenter.co.kr/tq-test"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "block", marginTop: 20, padding: "14px 0", background: "linear-gradient(135deg, #7c3aed, #9333ea)", color: "#fff", textAlign: "center", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", letterSpacing: "0.5px" }}
        >
          TQ테스트 알아보기 →
        </a>
      </div>
    </div>
  );
}
