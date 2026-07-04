import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    const correctPassword = process.env.COACH_PASSWORD;

    if (!correctPassword) {
      console.error("COACH_PASSWORD env variable is not set.");
      return NextResponse.json(
        { error: "Cấu hình Server lỗi, vui lòng liên hệ admin." },
        { status: 500 }
      );
    }

    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Mật khẩu không chính xác." },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Định dạng yêu cầu không hợp lệ." },
      { status: 400 }
    );
  }
}
