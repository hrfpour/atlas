import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || "hrfpour";
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || "atlas";

/**
 * GET /api/feedback/list
 *
 * Returns feedback by reading open issues labeled "feedback-*" from your
 * GitHub repository. Each issue is one piece of feedback submitted via the form.
 */
export async function GET() {
  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      {
        ok: false,
        error: "GITHUB_TOKEN is not configured.",
        hint: "Set GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME in your environment.",
      },
      { status: 503 },
    );
  }

  try {
    const url = new URL(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`,
    );
    url.searchParams.set("state", "all");
    url.searchParams.set("labels", "feedback-bug,feedback-suggestion,feedback-question,feedback-other");
    url.searchParams.set("per_page", "100");
    url.searchParams.set("sort", "created");
    url.searchParams.set("direction", "desc");

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "atlas-feedback",
      },
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[/api/feedback/list] GitHub API error:", res.status, detail);
      return NextResponse.json(
        { ok: false, error: `GitHub API error (${res.status})` },
        { status: 502 },
      );
    }

    const issues = (await res.json()) as Array<{
      number: number;
      title: string;
      body: string;
      state: string;
      created_at: string;
      html_url: string;
      labels: Array<{ name: string }>;
    }>;

    const feedback = issues.map((it) => {
      const label = it.labels.find((l) => l.name.startsWith("feedback-"))?.name || "";
      const type = label.replace("feedback-", "");
      return {
        id: `issue-${it.number}`,
        number: it.number,
        type,
        title: it.title,
        message: it.body,
        state: it.state,
        createdAt: it.created_at,
        url: it.html_url,
      };
    });

    return NextResponse.json({ ok: true, count: feedback.length, feedback });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/feedback/list] failed:", msg);
    return NextResponse.json({ error: "Failed to read feedback" }, { status: 500 });
  }
}
