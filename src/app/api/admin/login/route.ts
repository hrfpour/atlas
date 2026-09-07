import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AUTH_COOKIE = "atlas_admin_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured on the server." },
      { status: 503 },
    );
  }

  let password = "";
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    password = params.get("password") || "";
  } else {
    try {
      const body = await req.json();
      password = typeof body?.password === "string" ? body.password : "";
    } catch {
      password = "";
    }
  }

  if (timingSafeEqual(password, expected)) {
    const res = NextResponse.redirect(new URL("/admin", req.url));
    res.cookies.set({
      name: AUTH_COOKIE,
      value: expected, // store the password itself; compared with timingSafeEqual
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  }

  // Wrong password: redirect back to /admin with an error flag.
  const res = NextResponse.redirect(new URL("/admin?err=1", req.url));
  return res;
}
