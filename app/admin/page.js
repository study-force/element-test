"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 카드가 하나뿐이므로 /admin 진입 시 곧바로 대시보드로 이동
export default function AdminHome() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/dashboard"); }, [router]);
  return null;
}
