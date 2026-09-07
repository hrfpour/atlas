"use client";

import { useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, RefreshCw, MessageSquare, Inbox } from "lucide-react";

type Message = {
  id: string;
  role: string;
  content: string;
  userAgent: string | null;
  device: string;
  createdAt: string; // ISO string
};

type Feedback = {
  id: string;
  type: string;
  message: string;
  email: string | null;
  locale: string;
  createdAt: string; // ISO string
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

export default function AdminClient({
  initialMessages,
  initialFeedback,
}: {
  initialMessages: Message[];
  initialFeedback: Feedback[];
}) {
  const [tab, setTab] = useState<"messages" | "feedback">("messages");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback);
  const [refreshing, setRefreshing] = useState(false);

  const refreshMessages = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/messages/list", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      /* ignore */
    } finally {
      setRefreshing(false);
    }
  }, []);

  const refreshFeedback = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/feedback/list", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback || []);
      }
    } catch {
      /* ignore */
    } finally {
      setRefreshing(false);
    }
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/messages?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const deleteFeedback = useCallback(async (id: string) => {
    if (!confirm("Delete this feedback?")) return;
    try {
      const res = await fetch(`/api/admin/feedback?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFeedback((prev) => prev.filter((f) => f.id !== id));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const userCount = messages.filter((m) => m.role === "user").length;
  const assistantCount = messages.filter((m) => m.role === "assistant").length;

  return (
    <main className="min-h-screen bg-background px-4 py-8" dir="ltr">
      <div className="mx-auto max-w-6xl">
        {/* header */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Atlas Admin
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Chat logs and user feedback.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (tab === "messages" ? refreshMessages() : refreshFeedback())}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
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

        {/* tabs */}
        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("messages")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "messages"
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Chat ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("feedback")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "feedback"
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Inbox className="h-4 w-4" />
            Feedback ({feedback.length})
          </button>
        </div>

        {/* messages tab */}
        {tab === "messages" ? (
          <div>
            <div className="mb-4 flex gap-2 text-xs">
              <Badge variant="secondary">{userCount} user</Badge>
              <Badge variant="secondary">{assistantCount} assistant</Badge>
              <Badge variant="outline">{messages.length} total</Badge>
            </div>
            {messages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                No chat messages yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-[90px]">Role</TableHead>
                      <TableHead className="w-[160px]">Device</TableHead>
                      <TableHead className="w-[160px]">Time</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
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
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {m.device}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                          {formatTime(m.createdAt)}
                        </TableCell>
                        <TableCell className="whitespace-pre-wrap break-words text-sm">
                          {m.content}
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => deleteMessage(m.id)}
                            aria-label="Delete message"
                            className="grid h-7 w-7 place-items-center rounded text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        ) : (
          /* feedback tab */
          <div>
            {feedback.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                No feedback submissions yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-[100px]">Type</TableHead>
                      <TableHead className="w-[100px]">Locale</TableHead>
                      <TableHead className="w-[160px]">Time</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="w-[160px]">Email</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedback.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[11px]">
                            {f.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {f.locale}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                          {formatTime(f.createdAt)}
                        </TableCell>
                        <TableCell className="whitespace-pre-wrap break-words text-sm">
                          {f.message}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground" dir="ltr">
                          {f.email || "—"}
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => deleteFeedback(f.id)}
                            aria-label="Delete feedback"
                            className="grid h-7 w-7 place-items-center rounded text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        <p className="mt-6 text-[11px] text-muted-foreground">
          Messages and feedback are persisted in the configured database
          (Postgres on Vercel). Protected by ADMIN_PASSWORD (cookie-based auth).
        </p>
      </div>
    </main>
  );
}
