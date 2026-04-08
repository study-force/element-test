import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const RESERVED = ["setup", "admin", "api", "setting", "_next", "favicon.ico"];

export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const body = await request.json();
    const { adminPw, slug, password } = body;

    // 관리자 비밀번호 확인
    if (adminPw !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "관리자 비밀번호가 틀렸습니다." }, { status: 401 });
    }

    // slug 검증
    if (!slug || slug.length < 2 || RESERVED.includes(slug)) {
      return NextResponse.json({ error: "사용할 수 없는 학원 ID입니다." }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
      return NextResponse.json({ error: "학원 ID는 영문, 숫자, -, _만 사용 가능합니다." }, { status: 400 });
    }
    if (!password || password.length < 4) {
      return NextResponse.json({ error: "비밀번호는 4자 이상이어야 합니다." }, { status: 400 });
    }

    // 중복 확인
    const { data: existing } = await supabase
      .from("academies")
      .select("slug")
      .eq("slug", slug)
      .single();
    if (existing) {
      return NextResponse.json({ error: "이미 존재하는 학원 ID입니다." }, { status: 409 });
    }

    // 생성
    const { data, error } = await supabase
      .from("academies")
      .insert([{ slug, password, name: null, tel: null }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, slug: data.slug });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 학원 목록 조회 (관리자용)
export async function GET(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data, error } = await supabase
      .from("academies")
      .select("slug, name, tel, created_at")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ academies: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
