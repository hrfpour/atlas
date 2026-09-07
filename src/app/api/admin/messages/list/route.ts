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

function formatUa(ua: string | null): string {
  if (!ua) return "—";
  const browser =
    /Edg\/([\d.]+)/.test(ua) ? "Edge" :
    /Chrome\/([\d.]+)/.test(ua) ? "Chrome" :
    /Firefox\/([\d.]+)/.test(ua) ? "Firefox" :
    /Safari\/([\d.]+)/.test(ua) ? "Safari" : "Browser";
  const os =
    /Windows NT/.test(ua) ? "Windows" :
    /Mac OS X/.test(ua) ? "macOS" :
    /iPhone|iPad|iPod/.test(ua) ? "iOS" :
    /Android/.test(ua) ? "Android" :
    /Linux/.test(ua) ? "Linux" : "Unknown OS";
  return `${browser} · ${os}`;
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
 * GET /api/admin/messages/list
 * Returns the latest chat messages with a short device label. Requires admin
 * auth cookie.
 */
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, role: true, content: true, userAgent: true, createdAt: true },
    });
    const messages = rows.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      device: formatUa(m.userAgent),
      createdAt: m.createdAt.toISOString(),
    }));
    return NextResponse.json({ ok: true, count: messages.length, messages });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/admin/messages/list] failed:", msg);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}
