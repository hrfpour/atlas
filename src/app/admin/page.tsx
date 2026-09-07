import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// This is a server component — it runs on the server and reads directly from
// the database. Force dynamic so it always reflects the latest messages
// (never a cached snapshot).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type MessageRow = {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
};

/**
 * Simple password gate for the admin dashboard.
 *
 * Set ADMIN_PASSWORD in your Vercel Environment Variables (Settings →
 * Environment Variables). Then visit:
 *   /admin?pwd=YOUR_PASSWORD
 *
 * If ADMIN_PASSWORD is not set, the page refuses to render (safer than
 * leaving it open). This is a lightweight protection — for a production
 * app with sensitive data, use NextAuth.js or similar.
 */
function checkAuth(pwd: string | string[] | undefined): {
  ok: boolean;
  reason?: string;
} {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return {
      ok: false,
      reason:
        "ADMIN_PASSWORD is not set. Add it in Vercel → Settings → Environment Variables, then visit /admin?pwd=YOUR_PASSWORD.",
    };
  }
  const provided = Array.isArray(pwd) ? pwd[0] : pwd;
  if (provided === expected) return { ok: true };
  return { ok: false, reason: "Wrong or missing password." };
}

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
  const auth = checkAuth(searchParams.pwd);
  if (!auth.ok) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4" dir="ltr">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Atlas Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold">Access denied</h1>
          <p className="mt-3 text-sm text-muted-foreground">{auth.reason}</p>
          {auth.reason?.includes("ADMIN_PASSWORD is not set") ? null : (
            <form className="mt-6 flex gap-2" method="get" action="">
              <input
                type="password"
                name="pwd"
                placeholder="Password"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                autoFocus
              />
              <button
                type="submit"
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
              >
                Enter
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  // Auth passed — fetch and show the messages.
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
        {/* header */}
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
          <div className="flex gap-2 text-xs">
            <Badge variant="secondary">{userCount} user</Badge>
            <Badge variant="secondary">{assistantCount} assistant</Badge>
            <Badge variant="outline">{messages.length} total</Badge>
          </div>
        </header>

        {/* error state */}
        {dbError ? (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">
            <p className="font-semibold">Could not load messages from the database.</p>
            <p className="mt-1 font-mono text-xs">{dbError}</p>
          </div>
        ) : null}

        {/* empty state */}
        {!dbError && messages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No chat messages yet. They will appear here once visitors start
            talking to the AI tutor.
          </div>
        ) : null}

        {/* table */}
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
          <code className="font-mono">Message</code> Prisma model, written
          asynchronously by the <code className="font-mono">/api/chat</code>{" "}
          route. Protected by ADMIN_PASSWORD.
        </p>
      </div>
    </main>
  );
}
