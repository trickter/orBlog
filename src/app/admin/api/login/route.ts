import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = await request.json();
  const { secret } = body;

  if (secret === process.env.ADMIN_SECRET) {
    const cookieStore = await cookies();
    cookieStore.set("admin_secret", secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
}
