"use client";

import { useState } from "react";
import { Math } from "@/components/math";
import { MixedText } from "@/components/mixed-text";
import { CopyButton } from "@/components/copy-button";
import type { Distribution } from "@/data/distributions";
import { backlinks } from "@/data/relationships";
import { usePick, useT } from "@/lib/i18n";
import { useFavorites } from "@/lib/favorites";
import { pythonCode, rCode } from "@/lib/code-snippets";
import { hasVoices, speak as ttsSpeak } from "@/lib/tts";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Star, Volume2, Link2 } from "lucide-react";

const accentColor: Record<Distribution["accent"], string> = {
  emerald: "var(--accent-emerald)",
  amber: "var(--accent-amber)",
  rose: "var(--accent-rose)",
  teal: "var(--accent-teal)",
  violet: "var(--accent-violet)",
  slate: "var(--accent-slate)",
};

export function DistributionCard({ d }: { d: Distribution }) {
  const pick = usePick();
  const t = useT();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"python" | "r">("python");
  const fav = useFavorites();

  const accent = accentColor[d.accent];
  const isDiscrete = d.category === "discrete";
  const bl = backlinks[d.id];
  const incoming = (bl?.incoming ?? []).length;
  const outgoing = (bl?.outgoing ?? []).length;

  const speak = () => {
    // Only the name (no LaTeX formulas) — readable & meaningful in audio.
    // Always use the English name + an English voice, since most browsers
    // ship an English TTS voice by default (Persian voices are rare). This
    // matches the user's request that the same English audio plays in both
    // language modes.
    const enText = `${d.name} distribution.`;

    // Detect upfront whether ANY voice is installed, for fallback decisions.
    const voicesAvailable = hasVoices();

    // If no voices at all are installed, the browser cannot speak — show the
    // name visually right away rather than waiting for a silent failure.
    if (!voicesAvailable) {
      toast({
        title: enText,
        description: pick({
          fa: "روخوانی صوتی در این مرورگر فعال نیست؛ نام توزیع نمایش داده شد. برای فعال‌سازی صدا، یک موتور گفتار (TTS) نصب کنید.",
          en: "Audio is unavailable in this browser; the distribution name is shown. Install a text-to-speech engine to enable audio.",
        }),
      });
      return;
    }

    // IMPORTANT: call speak() synchronously within the user-gesture handler
    // (no `await` before it). We attach the result listeners and handle the
    // outcome after the call returns.
    const resultP = ttsSpeak(enText, "en-US");

    resultP.then((result) => {
      if (result.ok) return;
      toast({
        title: enText,
        description: pick({
          fa: "روخوانی صوتی در دسترس نیست؛ نام توزیع نمایش داده شد.",
          en: "Audio is unavailable; the distribution name is shown instead.",
        }),
      });
    });
  };

  return (
    <article
      id={`dist-${d.id}`}
      className="group relative flex h-full scroll-mt-24 flex-col overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: `color-mix(in oklch, ${accent} 35%, var(--border))` }}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} />

      {/* header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold leading-tight text-foreground">{d.name}</h3>
          <p className="text-sm text-muted-foreground">{d.fa}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={speak}
            aria-label={t("readAloud")}
            className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Volume2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => fav.toggle(d.id)}
            aria-label="favorite"
            className={cn(
              "grid h-7 w-7 place-items-center rounded-md border border-border transition-colors",
              fav.has(d.id)
                ? "text-amber-500"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Star className="h-3.5 w-3.5" fill={fav.has(d.id) ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* category + tags */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{
            backgroundColor: `color-mix(in oklch, ${accent} 16%, transparent)`,
            color: `color-mix(in oklch, ${accent} 60%, var(--foreground))`,
          }}
        >
          {isDiscrete ? t("discrete") : t("continuous")}
        </span>
        {d.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>

      {/* law */}
      <div className="mb-3 rounded-lg bg-muted/50 p-3">
        <div className="mb-1">
          <span className="rounded bg-foreground/5 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-muted-foreground">
            {d.lawLabel}
          </span>
        </div>
        <Math tex={d.law} display />
      </div>

      {/* params */}
      <dl className="mb-3 space-y-1">
        {d.params.map((p) => (
          <div key={p.sym} className="flex items-baseline gap-2 text-xs">
            <dt className="shrink-0"><Math tex={p.sym} /></dt>
            <dd className="text-muted-foreground">{pick(p.desc)}</dd>
          </div>
        ))}
      </dl>

      {/* stats grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label={t("support")}><Math tex={d.support} /></Stat>
        <Stat label={t("mean")}><Math tex={d.mean} /></Stat>
        <Stat label={t("variance")}><Math tex={d.variance} /></Stat>
      </div>

      {/* desc + notes */}
      <div className="mt-3 space-y-2">
        <p className="text-sm leading-relaxed text-foreground/90"><MixedText text={pick(d.desc)} /></p>
        <p className="border-s-2 ps-2 text-xs leading-relaxed text-muted-foreground" style={{ borderColor: `color-mix(in oklch, ${accent} 50%, transparent)` }}>
          <MixedText text={pick(d.notes)} />
        </p>
      </div>

      {/* backlinks */}
      {(incoming + outgoing > 0) ? (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Link2 className="h-3 w-3" />
          <span>{t("backlinks")}:</span>
          <a href="#relationships" className="flex items-center gap-1 rounded border border-border px-1.5 py-0.5 hover:bg-muted">
            <span className="text-emerald-600" aria-hidden>↙</span>
            <span>{incoming}</span>
            <span className="mx-0.5 opacity-40">·</span>
            <span className="text-amber-600" aria-hidden>↗</span>
            <span>{outgoing}</span>
          </a>
        </div>
      ) : null}

      {/* advanced toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-3 flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        {open ? t("hideAdvanced") : t("showAdvanced")}
      </button>

      {open ? (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {/* advanced math grid */}
          <div className="grid grid-cols-2 gap-2">
            <AdvStat label={t("cdf")} tex={d.cdf} />
            <AdvStat label={t("mgf")} tex={d.mgf} />
            <AdvStat label={t("skewness")} tex={d.skewness} />
            <AdvStat label={t("kurtosis")} tex={d.kurtosis} />
            <AdvStat label={t("mode")} tex={d.mode} />
            <AdvStat label={t("median")} tex={d.median} />
            <AdvStat label={t("entropy")} tex={d.entropy} />
            {d.hazard ? <AdvStat label={t("hazard")} tex={d.hazard} /> : null}
          </div>

          {/* example, history, mistakes */}
          <Detail label={t("example")} text={pick(d.example)} accent={accent} />
          <Detail label={t("history")} text={pick(d.history)} accent={accent} />
          <Detail label={t("commonMistakes")} text={pick(d.mistakes)} accent={accent} />

          {/* code */}
          <div className="rounded-lg border border-border bg-muted/40 p-2">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex gap-1">
                {(["python", "r"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setTab(k)}
                    className={cn(
                      "rounded px-2 py-0.5 text-[11px] font-semibold transition-colors",
                      tab === k ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {k === "python" ? t("codePython") : t("codeR")}
                  </button>
                ))}
              </div>
              <CopyButton text={tab === "python" ? pythonCode(d) : rCode(d)} label={t("copy")} />
            </div>
            <pre dir="ltr" className="atlas-scroll overflow-x-auto rounded bg-background/60 p-2 text-[11px] leading-relaxed text-foreground/90">
              <code>{tab === "python" ? pythonCode(d) : rCode(d)}</code>
            </pre>
          </div>

          {/* sources */}
          <div className="text-[11px] text-muted-foreground">
            <span className="font-semibold">{t("sources")}:</span>{" "}
            {d.sources.join(" · ")}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/40 px-1.5 py-2">
      <div className="mb-1 text-[10px] font-semibold text-muted-foreground">{label}</div>
      <div className="atlas-scroll overflow-x-auto text-[11px]" dir="ltr">
        <span className="inline-block min-w-full whitespace-nowrap text-left">{children}</span>
      </div>
    </div>
  );
}

function AdvStat({ label, tex }: { label: string; tex: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-2">
      <div className="mb-1 text-[10px] font-semibold text-muted-foreground">{label}</div>
      <div className="atlas-scroll overflow-x-auto text-[11px]" dir="ltr">
        <Math tex={tex || "\\varnothing"} />
      </div>
    </div>
  );
}

function Detail({ label, text, accent }: { label: string; text: string; accent: string }) {
  return (
    <div className="border-s-2 ps-2 text-xs leading-relaxed text-muted-foreground" style={{ borderColor: `color-mix(in oklch, ${accent} 40%, transparent)` }}>
      <span className="font-semibold text-foreground/80">{label}: </span>
      <MixedText text={text} />
    </div>
  );
}
