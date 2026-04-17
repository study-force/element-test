import { NextResponse } from "next/server";

// 환경별 Legacy API URL
const LEGACY_API_URL = process.env.LEGACY_API_URL ||
  "https://www.futuretraining.co.kr:8143/service-back";

// 학원 확인 (Legacy API 연동)
export async function GET(request, { params }) {
  try {
    const { slug: academyId } = await params;

    const res = await fetch(
      `${LEGACY_API_URL}/api/public/academy/element-check?academyId=${encodeURIComponent(academyId)}`,
      { next: { revalidate: 60 } } // 1분 캐시
    );

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data.errors?.fieldName || data.message || "학원을 찾을 수 없습니다.";
      return NextResponse.json({ error: errorMsg, _debug_url: LEGACY_API_URL }, { status: 404 });
    }

    return NextResponse.json({
      slug: academyId,
      name: data.academyName,
      tel: data.academyPhone,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
