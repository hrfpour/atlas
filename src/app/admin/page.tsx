import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Send no-cache headers so the admin page ALWAYS shows the latest messages
// (fixes the "first message missing until refresh" symptom — the browser
// was serving a stale cached snapshot of /admin).
export const fetchCache = "force-no-store";
export const revalidate = 0;

type MessageRow = {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
};

/**
 * Password gate for the admin dashboard using a cookie (NOT a URL param).
 *
 * Set ADMIN_PASSWORD in Vercel → Settings → Environment Variables.
 *
 * Flow:
 *   - Visit /admin → if no valid auth cookie, show a login form.
 *   - POST the form with the password → server sets a short-lived signed
 *     cookie and reloads /admin.
 *   - Subsequent visits read the cookie; the password never appears in the URL.
 *
 * If ADMIN_PASSWORD is not set, the page refuses to render.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

const AUTH_COOKIE = "atlas_admin_auth";
// Cookie validity: 24 hours.
const COOKIE_MAX_AGE = 60 * 60 * 24;

function formatTime(d: Date): string {
  try {
    return d.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return d.toISOString();
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const jar = cookies();
  const expected = process.env.ADMIN_PASSWORD;

  const authed = (() => {
    const cookieVal = jar.get(AUTH_COOKIE)?.value;
    if (!cookieVal || !expected) return false;
    return timingSafeEqual(cookieVal, expected);
  })();

  const hasError = searchParams?.err === "1";

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

  // --- Not authed: show login form (password never goes in the URL) ---
  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4" dir="ltr">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Atlas Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold">Access denied</h1>
          {hasError ? (
            <p className="mt-3 rounded-lg bg-rose-500/10 p-2 text-sm text-rose-700 dark:text-rose-300">
              Wrong password. Try again.
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Enter the admin password to view chat logs.
            </p>
          )}
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

  // --- Authed: fetch and show messages ---
  let messages: MessageRow[] = [];
  let dbError: string | null = null;
  try {
    messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (err: unknown) {
    dbError = err instanceof Error ? err.message : String(err);
    console.error("[/admin] failed to load messages:", dbError);
  }

  const userCount = messages.filter((m) => m.role === "user").length;
  const assistantCount = messages.filter((m) => m.role === "assistant").length;

  return (
    <main className="min-h-screen bg-background px-4 py-8" dir="ltr">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Atlas Admin
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Chat Logs
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              The latest 100 chat messages exchanged with the AI tutor.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary">{userCount} user</Badge>
            <Badge variant="secondary">{assistantCount} assistant</Badge>
            <Badge variant="outline">{messages.length} total</Badge>
            <form method="post" action="/api/admin/logout">
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Log out
              </button>
            </form>
          </div>
        </header>

        {dbError ? (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">
            <p className="font-semibold">Could not load messages from the database.</p>
            <p className="mt-1 font-mono text-xs">{dbError}</p>
          </div>
        ) : null}

        {!dbError && messages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No chat messages yet. They will appear here once visitors start
            talking to the AI tutor.
          </div>
        ) : null}

        {!dbError && messages.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[110px]">Role</TableHead>
                  <TableHead className="w-[170px]">Time</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Badge
                        variant={m.role === "user" ? "default" : "secondary"}
                        className="font-mono text-[11px]"
                      >
                        {m.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {formatTime(m.createdAt)}
                    </TableCell>
                    <TableCell className="whitespace-pre-wrap break-words text-sm">
                      {m.content}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}

        <p className="mt-6 text-[11px] text-muted-foreground">
          Messages are persisted in the configured database via the{" "}
          <code className="font-mono">Message</code> Prisma model. Protected by
          ADMIN_PASSWORD (cookie-based auth).
        </p>
      </div>
    </main>
  );
}
