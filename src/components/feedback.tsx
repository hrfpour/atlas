"use client";

import { useState } from "react";
import { Mail, Github, MessageCircle, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { usePick, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type FeedbackType = "bug" | "suggestion" | "question" | "other";

type Status = "idle" | "sending" | "sent" | "error";

export function Feedback() {
  const t = useT();
  const pick = usePick();
  const [type, setType] = useState<FeedbackType>("bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  // FormSubmit endpoint — sends the message straight to your email.
  // Works on fully static hosts (GitHub Pages) with no server needed.
  // First submission triggers a one-time confirmation email from FormSubmit.
  const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/hrfpour@gmail.com";

  const submit = async () => {
    if (!message.trim()) return;
    setStatus("sending");
    const locale = pick({ fa: "fa", en: "en" });

    // 1. Try the server-side API (works on VPS / Vercel / any host with a
    //    running Next.js server — it creates a GitHub Issue).
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message, email, locale }),
      });
      if (res.ok) {
        setStatus("sent");
        setMessage("");
        setEmail("");
        return;
      }
    } catch {
      /* fall through to FormSubmit */
    }

    // 2. Fallback for static hosts (GitHub Pages): submit via FormSubmit,
    //    which emails the message directly to you. No server needed.
    try {
      const res = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `[Atlas feedback] ${type}`,
          type,
          message,
          email: email || "(not provided)",
          locale,
          page: typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      if (!res.ok) throw new Error("formsubmit failed");
      setStatus("sent");
      setMessage("");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  const typeLabel = (tt: FeedbackType) => {
    switch (tt) {
      case "bug":
        return t("feedbackTypeBug");
      case "suggestion":
        return t("feedbackTypeSuggestion");
      case "question":
        return t("feedbackTypeQuestion");
      case "other":
        return t("feedbackTypeOther");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* form */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-1 text-lg font-bold">{t("feedbackForm")}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{t("feedbackFormDesc")}</p>

        {/* type selector */}
        <div className="mb-4">
          <span className="mb-2 block text-xs font-semibold text-muted-foreground">{t("feedbackType")}</span>
          <div className="flex flex-wrap gap-2">
            {(["bug", "suggestion", "question", "other"] as FeedbackType[]).map((tt) => (
              <button
                key={tt}
                type="button"
                onClick={() => setType(tt)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  type === tt
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
                )}
              >
                {typeLabel(tt)}
              </button>
            ))}
          </div>
        </div>

        {/* message */}
        <div className="mb-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("feedbackPlaceholder")}
            rows={5}
            dir="auto"
            className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* email */}
        <div className="mb-4">
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            {t("feedbackEmail")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("feedbackEmailPlaceholder")}
            dir="ltr"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* status */}
        {status === "sent" ? (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            {t("feedbackSent")}
          </div>
        ) : status === "error" ? (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4" />
            {t("feedbackError")}
          </div>
        ) : null}

        <button
          type="button"
          onClick={submit}
          disabled={!message.trim() || status === "sending"}
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
          {status === "sending" ? t("feedbackSending") : t("feedbackSend")}
        </button>
      </div>

      {/* direct contact */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-1 text-lg font-bold">{t("feedbackDirect")}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{t("feedbackDirectDesc")}</p>
        <div className="space-y-3">
          <ContactLink
            href="mailto:hrfpour@gmail.com"
            icon={<Mail className="h-4 w-4" />}
            label={pick({ fa: "ایمیل", en: "Email" })}
            value="hrfpour@gmail.com"
          />
          <ContactLink
            href="https://github.com/hrfpour"
            icon={<Github className="h-4 w-4" />}
            label={pick({ fa: "گیت‌هاب", en: "GitHub" })}
            value="github.com/hrfpour"
          />
          <ContactLink
            href="#chat"
            icon={<MessageCircle className="h-4 w-4" />}
            label={pick({ fa: "دستیار هوش اطلس", en: "Atlas AI Assistant" })}
            value={pick({ fa: "پرسش زنده در سایت", en: "Live chat on site" })}
          />
        </div>
      </div>
    </div>
  );
}

function ContactLink({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted"
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-foreground/5 text-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <div className="truncate text-xs text-muted-foreground" dir="ltr">
          {value}
        </div>
      </div>
    </a>
  );
}
