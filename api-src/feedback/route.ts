import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TYPES = ["bug", "suggestion", "question", "other"];

/**
 * POST /api/feedback
 *
 * On a static host (GitHub Pages) there is no server to run a DB. So we forward
 * the feedback as a new GitHub Issue in your repository, which you can read and
 * reply to directly on GitHub.
 *
 * Configure via environment variables (in your hosting dashboard or .env):
 *   GITHUB_TOKEN      — a fine-grained PAT with "Issues: Write" on the repo
 *   GITHUB_REPO_OWNER — e.g. "hrfpour"
 *   GITHUB_REPO_NAME  — e.g. "atlas"  (the repo hosting the site)
 *
 * If the env vars are missing, the endpoint returns a clear error so the
 * frontend can show the direct-contact links as a fallback.
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || "hrfpour";
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || "atlas";

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

    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        {
          ok: false,
          error: "GITHUB_TOKEN is not configured. Set it in your hosting environment.",
        },
        { status: 503 },
      );
    }

    const typeLabel =
      { bug: "Bug", suggestion: "Suggestion", question: "Question", other: "Other" }[
        type as "bug" | "suggestion" | "question" | "other"
      ] || "Other";

    const title = `[${typeLabel}] ${message.slice(0, 60)}${message.length > 60 ? "…" : ""}`;
    const body_md = [
      `**Type:** ${typeLabel}`,
      `**Locale:** ${locale}`,
      email ? `**Email:** ${email}` : "",
      `**User-Agent:** ${userAgent}`,
      "",
      "### Message",
      "",
      message,
      "",
      "---",
      "_Submitted from the Atlas feedback form._",
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
          "User-Agent": "atlas-feedback",
        },
        body: JSON.stringify({
          title,
          body: body_md,
          labels: [`feedback-${type}`],
        }),
      },
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[/api/feedback] GitHub API error:", res.status, detail);
      return NextResponse.json(
        { ok: false, error: `GitHub API error (${res.status})` },
        { status: 502 },
      );
    }

    const issue = (await res.json()) as { number: number; html_url: string };
    return NextResponse.json({
      ok: true,
      id: `issue-${issue.number}`,
      url: issue.html_url,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/feedback] failed:", msg);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/feedback",
    method: "POST",
    description:
      "Submit feedback as a GitHub Issue in the configured repository. Read & reply to feedback directly on GitHub.",
    requiredEnv: ["GITHUB_TOKEN", "GITHUB_REPO_OWNER", "GITHUB_REPO_NAME"],
    configured: {
      hasToken: Boolean(GITHUB_TOKEN),
      repo: `${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`,
    },
  });
}
