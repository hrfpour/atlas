import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AUTH_COOKIE = "atlas_admin_auth";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function isAuthed() {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const jar = await cookies();
  const cookieVal = jar.get(AUTH_COOKIE)?.value;
  if (!cookieVal) return false;
  return timingSafeEqual(cookieVal, expected);
}

/**
 * DELETE /api/admin/feedback?id=<id>
 * Deletes a single feedback submission. Requires admin auth cookie.
 */
export async function DELETE(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  try {
    await prisma.feedback.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/admin/feedback] delete failed:", msg);
    return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 });
  }
}
