"use client";
import { useEffect, useState } from "react";

export default function TQRulesPage() {
  const [src, setSrc] = useState("");

  useEffect(() => {
    const host = window.location.hostname;
    const isDev = /localhost|vercel\.app|dev\.element\.sfcenter\.co\.kr/.test(host);
    setSrc(
      isDev
        ? "https://dev.tq.sfcenter.co.kr/tq_admin_rules.html"
        : "https://tq.sfcenter.co.kr/tq_admin_rules.html"
    );
  }, []);

  return (
    <div style={{ height: "100%", overflow: "hidden" }}>
      {src && (
        <iframe
          src={src}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="TQ Rules Admin"
        />
      )}
    </div>
  );
}
