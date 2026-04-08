import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// 학원 정보 조회
export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data, error } = await supabase
      .from("academies")
      .select("slug, name, tel")
      .eq("slug", decodeURIComponent(slug))
      .single();

    if (error || !data) return NextResponse.json({ error: "학원을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 학원 정보 수정 (비밀번호 인증 후)
export async function PUT(request, { params }) {
  try {
    const { slug } = await params;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const body = await request.json();
    const { password, name, tel } = body;

    // 비밀번호 확인
    const { data: academy } = await supabase
      .from("academies")
      .select("password")
      .eq("slug", decodeURIComponent(slug))
      .single();

    if (!academy) return NextResponse.json({ error: "학원을 찾을 수 없습니다." }, { status: 404 });
    if (academy.password !== password) return NextResponse.json({ error: "비밀번호가 틀렸습니다." }, { status: 401 });

    // 업데이트
    const { data, error } = await supabase
      .from("academies")
      .update({ name, tel })
      .eq("slug", decodeURIComponent(slug))
      .select("slug, name, tel")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
