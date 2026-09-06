import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { distributions } from "@/data/distributions";
import { relationships } from "@/data/relationships";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

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
    "2. Be concise: 3 to 6 sentences. Do not write essays.",
    "3. When relevant, mention distribution ids verbatim from the list above (e.g. \"binomial\", \"negative-binomial\", \"chi-square\") so the UI can deep-link to the matching card. Mention at most 3 ids per answer and only when they are genuinely relevant.",
    "4. Use inline LaTeX for math, delimited with single $ characters. Example: $X\\sim N(\\mu,\\sigma^{2})$. Do NOT use $$ ... $$ display blocks. Keep formulas readable.",
    "5. Never invent distributions, ids, or relationships that are not in the two lists above. If a question asks about something outside the atlas, say so briefly and steer back to what the atlas covers.",
    "6. Do not wrap the whole answer in quotes or code blocks. Output plain text (optionally with inline $...$ math and short Markdown emphasis).",
  ].join("\n");
}

export async function POST(req: Request) {
  // ----- parse & validate body -----
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const incoming = Array.isArray(body?.messages) ? body.messages : [];
  if (incoming.length === 0) {
    return NextResponse.json(
      { error: "messages[] is required" },
      { status: 400 },
    );
  }

  const locale: Locale = body?.locale === "en" ? "en" : "fa";

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

  // Per the z-ai-web-dev-sdk LLM skill, the system prompt is supplied as the
  // first message with role "assistant".
  const messagesForModel = [
    { role: "assistant" as const, content: systemPrompt },
    ...history,
  ];

  // ----- call the model -----
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: messagesForModel,
      stream: false,
      thinking: { type: "disabled" },
    });

    const reply = completion?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json(
        { error: "Model returned an empty response" },
        { status: 502 },
      );
    }

    // Extract the latest user message from history
    const lastUserMessage = history.filter(m => m.role === "user").pop()?.content || "";

    // Persist both user query and assistant reply into the cloud database asynchronously
    if (lastUserMessage) {
      prisma.message.createMany({
        data: [
          { role: "user", content: lastUserMessage },
          { role: "assistant", content: reply },
        ],
      }).catch((dbErr) => {
        console.error("Failed to save chat to database:", dbErr);
      });
    }

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/chat] z-ai completion failed:", msg);
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
    body: { messages: "{role, content}[]", locale: '"fa" | "en"' },
  });
}