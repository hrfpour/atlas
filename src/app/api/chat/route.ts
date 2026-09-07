import { NextResponse } from "next/server";
import { distributions } from "@/data/distributions";
import { relationships } from "@/data/relationships";
import { prisma } from "@/lib/prisma";

// Gemini API runs server-side only. Use the Node.js runtime (not Edge) for the
// best compatibility with environment variables on Vercel.
export const runtime = "nodejs";
// Always treat this route as dynamic; never cache a chat completion.
export const dynamic = "force-dynamic";

type Locale = "fa" | "en";

type IncomingMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatRequestBody = {
  messages?: IncomingMessage[];
  locale?: Locale;
};

/**
 * Read the Gemini API key from environment variables. Accept either
 * GEMINI_API_KEY or GOOGLE_API_KEY (both are common conventions) so you can
 * paste whichever name your provider dashboard shows.
 *
 * In Vercel: Settings → Environment Variables → add GEMINI_API_KEY (or
 * GOOGLE_API_KEY) with the key from https://aistudio.google.com/app/apikey
 */
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

/**
 * The Gemini model to use. "gemini-1.5-flash" is fast, cheap, and multilingual
 * (handles Persian well). Switch to "gemini-1.5-pro" for higher quality at
 * higher cost. You can override via the GEMINI_MODEL env var.
 */
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

const GEMINI_API_BASE =
  process.env.GEMINI_API_BASE ||
  "https://generativelanguage.googleapis.com/v1beta";

/**
 * Build the system prompt for the Atlas AI tutor. The prompt embeds a compact
 * snapshot of every distribution and every relationship from the data files so
 * the model can ground its answers in the same content the UI is rendering.
 */
function buildSystemPrompt(locale: Locale): string {
  const distLines = distributions
    .map((d) => `- ${d.id} | ${d.name} | ${d.fa} | ${d.category}`)
    .join("\n");

  const relLines = relationships
    .map((r) => `- ${r.from} -> ${r.to} | ${r.type} | ${r.formula}`)
    .join("\n");

  const languageDirective =
    locale === "fa"
      ? "ALWAYS answer in Persian (Farsi). Use Persian script for prose; keep Latin variable names, distribution ids, and LaTeX math as-is. Persian numerals are welcome."
      : "ALWAYS answer in English.";

  return [
    'You are "Ask the Atlas" — the AI tutor inside the "Atlas of Statistical Distributions", a bilingual (Persian / English) interactive reference of probability distributions and the analytic relationships between them (limits, sums, transformations, ratios, mixtures, special cases, generalizations, stochastic processes).',
    "",
    languageDirective,
    "",
    "DISTRIBUTIONS IN THE ATLAS (id | English name | Persian name | category):",
    distLines,
    "",
    "RELATIONSHIPS IN THE ATLAS (from -> to | type | formula):",
    relLines,
    "",
    "ANSWERING RULES:",
    "1. Stay on-topic: probability distributions, their parameters, moments (mean/variance), support, PMF/PDF, and how they relate to one another (limits, sums, transformations, ratios, mixtures, etc.). General statistics questions are OK if they help explain a distribution.",
    '2. Be concise: 3 to 6 sentences. Do not write essays.',
    '3. When relevant, mention distribution ids verbatim from the list above (e.g. "binomial", "negative-binomial", "chi-square") so the UI can deep-link to the matching card. Mention at most 3 ids per answer and only when they are genuinely relevant.',
    "4. Use inline LaTeX for math, delimited with single $ characters. Example: $X\\sim N(\\mu,\\sigma^{2})$. Do NOT use $$ ... $$ display blocks. Keep formulas readable.",
    "5. Never invent distributions, ids, or relationships that are not in the two lists above. If a question asks about something outside the atlas, say so briefly and steer back to what the atlas covers.",
    "6. Do not wrap the whole answer in quotes or code blocks. Output plain text (optionally with inline $...$ math and short Markdown emphasis).",
  ].join("\n");
}

/**
 * Convert the chat history into Gemini's `contents` format. Gemini uses role
 * "user" for human turns and "model" for assistant turns. The system prompt is
 * passed separately via `systemInstruction`.
 */
function toGeminiContents(history: { role: "user" | "assistant"; content: string }[]) {
  return history.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));
}

export async function POST(req: Request) {
  // ----- parse & validate body -----
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const incoming = Array.isArray(body?.messages) ? body.messages : [];
  if (incoming.length === 0) {
    return NextResponse.json(
      { error: "messages[] is required" },
      { status: 400 },
    );
  }

  const locale: Locale = body?.locale === "en" ? "en" : "fa";

  // If no API key is configured, return a clear error so the frontend can show
  // a helpful fallback message instead of silently failing.
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY (or GOOGLE_API_KEY) is not set. Add it in your hosting environment (e.g. Vercel → Settings → Environment Variables).",
      },
      { status: 503 },
    );
  }

  // Only keep user/assistant turns; drop anything that looks like a previous
  // system prompt so we control the system prompt from this route.
  const history = incoming
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content as string,
    }))
    .slice(-12); // keep last 12 turns to bound the request size

  const systemPrompt = buildSystemPrompt(locale);
  const contents = toGeminiContents(history);

  // Gemini generateContent endpoint:
  //   POST {BASE}/models/{MODEL}:generateContent?key={API_KEY}
  const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent`;

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.4,
      topP: 0.9,
      maxOutputTokens: 600,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };

  // ----- call Gemini -----
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        `[/api/chat] Gemini API error ${res.status}:`,
        detail.slice(0, 500),
      );
      return NextResponse.json(
        { error: `Gemini API error (${res.status})` },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
        finishReason?: string;
      }>;
      promptFeedback?: { blockReason?: string };
    };

    // Handle safety blocks gracefully.
    if (data.promptFeedback?.blockReason) {
      return NextResponse.json(
        { error: `Blocked by safety filter: ${data.promptFeedback.blockReason}` },
        { status: 502 },
      );
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim();

    if (!reply) {
      const reason = data.candidates?.[0]?.finishReason;
      return NextResponse.json(
        { error: `Model returned an empty response (finishReason: ${reason || "unknown"})` },
        { status: 502 },
      );
    }

    // ----- persist to the database -----
    // Save the latest user turn + the assistant reply. We AWAIT this so that
    // in serverless environments (Vercel) the function doesn't freeze and
    // kill the DB write before it completes. Failures are still logged and
    // do not surface to the user (the reply is already computed).
    const lastUserMessage =
      history.filter((m) => m.role === "user").pop()?.content || "";
    // Capture the visitor's browser/device so the admin can distinguish
    // different users (no PII — just User-Agent).
    const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? null;
    if (lastUserMessage) {
      try {
        await prisma.message.createMany({
          data: [
            { role: "user", content: lastUserMessage, userAgent },
            { role: "assistant", content: reply, userAgent },
          ],
        });
      } catch (dbErr: unknown) {
        console.error("[/api/chat] Failed to save chat to database:", dbErr);
      }
    }

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/chat] Gemini fetch failed:", msg);
    return NextResponse.json(
      { error: `Chat completion failed: ${msg}` },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/chat",
    method: "POST",
    provider: "Google Gemini",
    model: GEMINI_MODEL,
    body: { messages: "{role, content}[]", locale: '"fa" | "en"' },
    envVars: {
      GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY),
      GOOGLE_API_KEY: Boolean(process.env.GOOGLE_API_KEY),
    },
  });
}
