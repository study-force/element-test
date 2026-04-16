import { NextResponse } from "next/server";

// 학원 계정 관리는 Legacy 시스템으로 이관됨
export async function GET() {
  return NextResponse.json({ error: "사용 중단된 API입니다." }, { status: 410 });
}
export async function POST() {
  return NextResponse.json({ error: "사용 중단된 API입니다." }, { status: 410 });
}
