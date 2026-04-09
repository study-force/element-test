"use client";
export default function TQRulesPage() {
  return (
    <div style={{ margin: "-32px -40px", height: "100vh", overflow: "hidden" }}>
      <iframe
        src="https://tq.sfcenter.co.kr/tq_admin_rules.html"
        style={{ width: "100%", height: "100%", border: "none", overflow: "auto" }}
        title="TQ Rules Admin"
      />
    </div>
  );
}
