import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import AdminClient from "./admin-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Prevent all caching so the admin always sees the latest data.
export const fetchCache = "force-no-store";
export const revalidate = 0;

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
  // Extract a short, human-readable device/browser summary from the UA.
  // e.g. "Chrome 120 · Windows" or "Safari · iPhone"
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

export default async function AdminPage() {
  // Next.js 15+: cookies() is async.
  const jar = await cookies();
  const expected = process.env.ADMIN_PASSWORD;

  const authed = (() => {
    const cookieVal = jar.get(AUTH_COOKIE)?.value;
    if (!cookieVal || !expected) return false;
    return timingSafeEqual(cookieVal, expected);
  })();

  // --- Not configured ---
  if (!expected) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4" dir="ltr">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Atlas Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold">Not configured</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            ADMIN_PASSWORD is not set. Add it in Vercel → Settings →
            Environment Variables, then visit /admin again.
          </p>
        </div>
      </main>
    );
  }

  // --- Not authed: show login form ---
  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4" dir="ltr">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Atlas Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold">Access denied</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Enter the admin password to view chat logs and feedback.
          </p>
          <form className="mt-6 flex flex-col gap-3" method="post" action="/api/admin/login">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoFocus
              required
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
            >
              Enter
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- Authed: fetch initial data server-side, then hand off to the client
  // component for interactivity (delete buttons, tab switching). ---
  let messages: Array<{
    id: string;
    role: string;
    content: string;
    userAgent: string | null;
    createdAt: Date;
  }> = [];
  let feedback: Array<{
    id: string;
    type: string;
    message: string;
    email: string | null;
    locale: string;
    createdAt: Date;
  }> = [];

  try {
    messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, role: true, content: true, userAgent: true, createdAt: true },
    });
  } catch (err) {
    console.error("[/admin] messages load failed:", err);
  }
  try {
    feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (err) {
    console.error("[/admin] feedback load failed:", err);
  }

  // Pre-format the userAgent into a short device label for the table.
  const messagesWithDevice = messages.map((m) => ({
    ...m,
    device: formatUa(m.userAgent),
    createdAt: m.createdAt.toISOString() as unknown as Date,
  }));
  const feedbackWithIso = feedback.map((f) => ({
    ...f,
    createdAt: f.createdAt.toISOString() as unknown as Date,
  }));

  return (
    <AdminClient
      initialMessages={messagesWithDevice}
      initialFeedback={feedbackWithIso}
    />
  );
}
