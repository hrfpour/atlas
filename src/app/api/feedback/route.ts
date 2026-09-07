import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TYPES = ["bug", "suggestion", "question", "other"];

/**
 * POST /api/feedback
 *
 * Persists user feedback (bug reports / suggestions / questions) to the
 * database via the Feedback Prisma model. Each submission is stored with
 * its type, message, optional email (for replies), locale, and user-agent.
 *
 * Configure: only DATABASE_URL is needed (the same Postgres connection used
 * by the chat persistence + admin dashboard).
 *
 * To read submitted feedback, query the Feedback table via Prisma Studio
 * (`npx prisma studio`) or extend the /admin page.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }
    const message = body.message.trim();
    if (message.length === 0) {
      return NextResponse.json({ error: "message cannot be empty" }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "message too long" }, { status: 400 });
    }
    const type = VALID_TYPES.includes(body.type) ? body.type : "other";
    const email =
      typeof body.email === "string" && body.email.trim().length > 0
        ? body.email.trim().slice(0, 320)
        : null;
    const locale = body.locale === "en" ? "en" : "fa";
    const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? null;

    const feedback = await prisma.feedback.create({
      data: { type, message, email, locale, userAgent },
    });

    return NextResponse.json({ ok: true, id: feedback.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/feedback] failed:", msg);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/feedback",
    method: "POST",
    description:
      "Submit feedback (bug / suggestion / question). Stored in the Feedback table of the configured database.",
  });
}
