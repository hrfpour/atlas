import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AUTH_COOKIE = "atlas_admin_auth";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/admin", req.url));
  res.cookies.set({
    name: AUTH_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0, // delete the cookie
    path: "/",
  });
  return res;
}
