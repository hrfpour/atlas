"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { AlertCircle, Eraser, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Math } from "@/components/math";
import { useT, useDir, useI18n, usePick } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { distributionsById } from "@/data/distributions";
import { cn } from "@/lib/utils";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  error?: boolean;
};

let idCounter = 0;
const genId = () => `m-${++idCounter}-${Date.now()}`;
const WELCOME_ID = "welcome";

/**
 * "Ask the Atlas" — a bilingual AI tutor panel that POSTs to /api/chat.
 *
 * The server route (/api/chat) talks to Google Gemini and reads the API key
 * from the GEMINI_API_KEY environment variable. This component is purely a
 * client UI that renders the conversation and handles input. Assistant replies
 * are rendered as mixed text + inline LaTeX, and any known distribution id
 * inside a reply is turned into a clickable anchor that jumps to the matching
 * distribution card (#dist-<id>).
 */
export function Chatbot() {
  const t = useT();
  const dir = useDir();
  const locale = useI18n((s) => s.locale);
  const pick = usePick();
  const { toast } = useToast();

  const welcomeContent = t("chatWelcome");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: WELCOME_ID, role: "assistant", content: welcomeContent },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  // Ref to the scrollable message list (NOT the page). We scroll this container
  // to its bottom when new messages arrive, so the chat panel scrolls
  // independently — the page itself is never scrolled by the chatbot.
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the chat panel (not the page) to the latest message.
  useEffect(() => {
    const el = listRef.current;
    if (el) {
      // Use 'auto' (instant) instead of 'smooth' so the page doesn't get a
      // smooth-scroll animation that could also drag the window.
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, thinking]);

  // Keep the welcome message in sync when the user toggles locale before
  // they've started chatting.
  useEffect(() => {
    setMessages((prev) => {
      if (
        prev.length === 1 &&
        prev[0].id === WELCOME_ID &&
        prev[0].content !== welcomeContent
      ) {
        return [{ ...prev[0], content: welcomeContent }];
      }
      return prev;
    });
  }, [welcomeContent]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: ChatMessage = {
      id: genId(),
      role: "user",
      content: text,
    };

    // Build the conversation we'll send to the API (drop the static welcome
    // message and any error bubbles — those shouldn't feed the model).
    const outgoing = [...messages, userMsg]
      .filter((m) => m.id !== WELCOME_ID && !m.error)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          messages: outgoing,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };

      if (!res.ok || !data.reply) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setMessages((prev) => [
        ...prev,
        { id: genId(), role: "assistant", content: data.reply as string },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      // On a static host (e.g. GitHub Pages) the /api/chat endpoint doesn't
      // exist, so the fetch fails. Guide the user to the direct contact links.
      const offlineMsg = pick({
        fa: "دستیار هوش در این میزبان (استاتیک) در دسترس نیست. برای پرسش‌های مستقیم، از بخش «گزارش مشکل» در انتهای صفحه استفاده کنید.",
        en: "The AI assistant is unavailable on this static host. For direct questions, please use the 'Report an issue' section at the bottom of the page.",
      });
      toast({
        title: t("chatError"),
        description: msg,
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev,
        {
          id: genId(),
          role: "assistant",
          content: offlineMsg,
          error: true,
        },
      ]);
    } finally {
      setThinking(false);
    }
  }, [input, thinking, messages, locale, t, toast, pick]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <section
      className="relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm"
      style={{
        borderColor:
          "color-mix(in oklch, var(--accent-violet) 35%, var(--border))",
      }}
    >
      {/* accent strip */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: "var(--accent-violet)" }}
      />

      {/* header */}
      <div className="flex items-start gap-3 border-b border-border px-5 py-4">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-xl text-white"
          style={{ background: "var(--accent-violet)" }}
        >
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-tight text-foreground">
            {t("chatTitle")}
          </h3>
          <p className="text-xs text-muted-foreground">{t("chatDesc")}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t("chatClearConfirm"))) {
              setMessages([{ id: WELCOME_ID, role: "assistant", content: welcomeContent }]);
              setInput("");
              setThinking(false);
            }
          }}
          aria-label={t("chatClear")}
          title={t("chatClear")}
          className="grid size-8 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Eraser className="size-4" />
        </button>
      </div>

      {/* message list */}
      <div
        ref={listRef}
        className="atlas-scroll max-h-96 overflow-y-auto px-4 py-4"
        dir={dir}
      >
        <div className="space-y-3">
          {messages.map((m) => (
            <Bubble key={m.id} message={m} dir={dir} />
          ))}
          {thinking ? <ThinkingBubble dir={dir} label={t("chatThinking")} /> : null}
        </div>
      </div>

      {/* input row */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("chatPlaceholder")}
            disabled={thinking}
            aria-label={t("chatPlaceholder")}
            className="flex-1"
            dir={dir}
          />
          <Button
            type="button"
            onClick={() => void send()}
            disabled={thinking || input.trim().length === 0}
            size="icon"
            aria-label={t("chatSend")}
            className="text-white hover:opacity-90"
            style={{ background: "var(--accent-violet)" }}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- bubbles ---------------- */

function Bubble({
  message,
  dir,
}: {
  message: ChatMessage;
  dir: "rtl" | "ltr";
}) {
  const isUser = message.role === "user";
  const isError = !!message.error;

  // User messages always render on the visual right, assistant on the visual
  // left — regardless of text direction.
  const justify =
    isUser
      ? dir === "rtl"
        ? "justify-start"
        : "justify-end"
      : dir === "rtl"
        ? "justify-end"
        : "justify-start";

  return (
    <div className={cn("flex w-full", justify)} dir={dir}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm",
          isUser
            ? "bg-foreground text-background"
            : isError
              ? "border border-destructive/40 bg-destructive/10 text-foreground"
              : "border border-border bg-muted/60 text-foreground",
        )}
        style={
          !isUser && !isError
            ? {
                borderColor:
                  "color-mix(in oklch, var(--accent-violet) 30%, var(--border))",
              }
            : undefined
        }
      >
        {isError ? (
          <div className="flex items-center gap-1.5 text-xs">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{message.content}</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            <RichParagraphs text={message.content} />
          </div>
        )}
      </div>
    </div>
  );
}

function ThinkingBubble({
  dir,
  label,
}: {
  dir: "rtl" | "ltr";
  label: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full",
        dir === "rtl" ? "justify-end" : "justify-start",
      )}
      dir={dir}
    >
      <div
        className="rounded-2xl border border-border bg-muted/60 px-3.5 py-2.5 text-sm text-muted-foreground"
        style={{
          borderColor:
            "color-mix(in oklch, var(--accent-violet) 30%, var(--border))",
        }}
      >
        <span className="inline-flex items-center gap-2">
          <span className="flex gap-1" aria-hidden>
            <Dot delay="0s" />
            <Dot delay="0.15s" />
            <Dot delay="0.3s" />
          </span>
          <span className="text-xs">{label}</span>
        </span>
      </div>
    </div>
  );
}

function Dot({ delay = "0s" }: { delay?: string }) {
  return (
    <span
      className="size-1.5 animate-bounce rounded-full"
      style={{ animationDelay: delay, background: "var(--accent-violet)" }}
    />
  );
}

/* ---------------- rich text rendering ---------------- */

function RichParagraphs({ text }: { text: string }) {
  const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 0);
  if (paragraphs.length === 0) {
    return <span>{text}</span>;
  }
  return (
    <>
      {paragraphs.map((para, i) => (
        <p key={i} className={cn("leading-relaxed", i > 0 && "mt-1.5")}>
          <RichInline text={para} />
        </p>
      ))}
    </>
  );
}

/**
 * Render a string that may contain inline LaTeX delimited by single `$`.
 * Text segments also get distribution-id linkification (e.g. `binomial`
 * becomes a link to #dist-binomial).
 */
function RichInline({ text }: { text: string }) {
  const parts = text.split("$");
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          // odd index => math segment
          return <Math key={i} tex={part} />;
        }
        return <TextWithLinks key={i} text={part} />;
      })}
    </>
  );
}

const ID_PATTERN_CACHE = new Map<string, RegExp>();

function TextWithLinks({ text }: { text: string }) {
  const idSet = useMemo(() => new Set(Object.keys(distributionsById)), []);

  const pattern = useMemo(() => {
    const cacheKey = [...idSet].sort().join("|");
    const cached = ID_PATTERN_CACHE.get(cacheKey);
    if (cached) return cached;
    const ids = [...idSet].sort((a, b) => b.length - a.length);
    const escaped = ids
      .map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    // Lookbehind / lookahead to avoid matching inside larger tokens
    // (e.g. URL slugs or hyphenated compound words).
    const re = new RegExp(
      `(?<![A-Za-z0-9-])(${escaped})(?![A-Za-z0-9-])`,
      "g",
    );
    ID_PATTERN_CACHE.set(cacheKey, re);
    return re;
  }, [idSet]);

  const segments = useMemo(
    () => text.split(pattern),
    [text, pattern],
  );

  return (
    <>
      {segments.map((seg, i) =>
        idSet.has(seg) ? (
          <a
            key={i}
            href={`#dist-${seg}`}
            className="font-medium underline decoration-dotted underline-offset-2 transition-opacity hover:opacity-80"
            style={{ color: "var(--accent-violet)" }}
          >
            {seg}
          </a>
        ) : (
          <span key={i}>{seg}</span>
        ),
      )}
    </>
  );
}
