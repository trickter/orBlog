import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Get client IP for rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";

  // Check rate limit
  const rateLimit = checkRateLimit(`login:${ip}`);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const adminSecret = process.env.ADMIN_SECRET;

  // Return error if ADMIN_SECRET is not configured
  if (!adminSecret) {
    return NextResponse.json(
      { error: "Admin is not configured" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { secret } = body;

  if (secret === adminSecret) {
    const sessionToken = createSessionToken();
    const cookieStore = await cookies();
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: "Invalid secret", remaining: rateLimit.remaining },
    { status: 401 }
  );
}
