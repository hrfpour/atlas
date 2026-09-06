"use client";

import { useMemo, useState } from "react";
import { Math } from "@/components/math";
import { MixedText } from "@/components/mixed-text";
import { distributions } from "@/data/distributions";
import { distributionsById } from "@/data/distributions";
import { comparisonRows } from "@/data/comparison-tables";
import { glossary } from "@/data/glossary";
import { foundations } from "@/data/foundations";
import { inequalities } from "@/data/inequalities";
import { inferenceMethods } from "@/data/inference";
import { stochasticProcesses } from "@/data/stochastic-processes";
import { conjugatePriors } from "@/data/conjugate-priors";
import { quiz as quizData } from "@/data/quiz";
import { useI18n, usePick, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

/* ---------- Interactive comparison ---------- */
export function ComparisonSelector() {
  const pick = usePick();
  const t = useT();
  const [selected, setSelected] = useState<string[]>([
    "normal",
    "exponential",
    "poisson",
  ]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return distributions;
    return distributions.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.fa.includes(q) ||
        d.id.includes(q),
    );
  }, [query]);

  const toggle = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  return (
    <div className="space-y-4">
      {/* selected chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground">
          {t("comparisonSelect")}:
        </span>
        {selected.map((id) => {
          const d = distributionsById[id];
          if (!d) return null;
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs"
            >
              <span className="font-semibold">{pick({ fa: d.fa, en: d.name })}</span>
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          );
        })}
        {selected.length < 2 ? (
          <span className="text-xs text-muted-foreground">{t("comparisonEmpty")}</span>
        ) : null}
      </div>

      {/* search + pick list */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type="search"
        placeholder={t("searchPlaceholder")}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        dir="auto"
      />
      <div className="atlas-scroll flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-border bg-muted/20 p-2">
        {filtered.map((d) => {
          const on = selected.includes(d.id);
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => toggle(d.id)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                on
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              {pick({ fa: d.fa, en: d.name })}
            </button>
          );
        })}
      </div>

      {/* comparison table */}
      {selected.length >= 2 ? (
        <div className="atlas-scroll max-w-full overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="p-3 text-start font-semibold">{pick({ fa: "ویژگی", en: "Property" })}</th>
                {selected.map((id) => {
                  const d = distributionsById[id];
                  return (
                    <th key={id} className="p-3 text-center font-semibold">
                      <a href={`#dist-${id}`} className="hover:underline">
                        {pick({ fa: d?.fa, en: d?.name })}
                      </a>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.id} className="border-b border-border/60 last:border-0">
                  <td className="p-3 text-start font-medium">
                    <MixedText text={pick(row.label)} />
                  </td>
                  {selected.map((id) => {
                    const cell = row.cell(id);
                    return (
                      <td key={id} className="p-3 text-center" dir="ltr">
                        {cell.includes("$") || /[\\]/.test(cell) ? (
                          <Math tex={cell} />
                        ) : (
                          cell
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Generic bilingual card list ---------- */
export function CardList({
  items,
  renderFormula,
  renderExtra,
}: {
  items: { id: string }[];
  renderFormula: (item: any) => string;
  renderExtra?: (item: any, pick: <T>(b: { fa: T; en: T }) => T) => React.ReactNode;
}) {
  const pick = usePick();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((item: any) => (
        <article key={item.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h3 className="font-bold">{pick({ fa: item.fa ?? item.title?.fa ?? item.name ?? item.id, en: item.name ?? item.title?.en ?? item.id })}</h3>
          </div>
          <div className="rounded-lg bg-muted/50 p-2" dir="ltr">
            <Math tex={renderFormula(item)} display />
          </div>
          {renderExtra ? <div className="mt-2 text-xs text-muted-foreground">{renderExtra(item, pick)}</div> : null}
        </article>
      ))}
    </div>
  );
}

export function Glossary() {
  const pick = usePick();
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {glossary.map((g) => (
        <article key={g.term} className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-1 text-sm font-bold">{g.term}</h3>
          <p className="text-xs text-muted-foreground">{g.fa}</p>
          <p className="mt-2 text-sm text-foreground/90">
            <MixedText text={pick(g.def)} />
          </p>
        </article>
      ))}
    </div>
  );
}

export function Foundations() {
  const pick = usePick();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {foundations.map((f) => (
        <article key={f.id} className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-2 font-bold"><MixedText text={pick(f.title)} /></h3>
          <p className="mb-2 text-sm text-muted-foreground"><MixedText text={pick(f.def)} /></p>
          <div className="rounded-lg bg-muted/50 p-2" dir="ltr"><Math tex={f.formula} display /></div>
          <p className="mt-2 text-xs text-muted-foreground"><MixedText text={pick(f.notes)} /></p>
        </article>
      ))}
    </div>
  );
}

export function Inequalities() {
  const pick = usePick();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {inequalities.map((it) => (
        <article key={it.id} className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-1 font-bold">{pick({ fa: it.fa, en: it.name })}</h3>
          <div className="my-2 rounded-lg bg-muted/50 p-2" dir="ltr"><Math tex={it.statement} display /></div>
          <p className="text-xs text-muted-foreground"><MixedText text={pick(it.intuition)} /></p>
          <p className="mt-1 text-xs text-muted-foreground"><MixedText text={pick(it.use)} /></p>
        </article>
      ))}
    </div>
  );
}

export function Inference() {
  const pick = usePick();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {inferenceMethods.map((m) => (
        <article key={m.id} className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-1 font-bold">{pick({ fa: m.fa, en: m.name })}</h3>
          <p className="mb-2 text-sm text-muted-foreground"><MixedText text={pick(m.idea)} /></p>
          <div className="rounded-lg bg-muted/50 p-2" dir="ltr"><Math tex={m.formula} display /></div>
          <p className="mt-2 text-xs text-muted-foreground"><MixedText text={pick(m.example)} /></p>
        </article>
      ))}
    </div>
  );
}

export function StochasticProcesses() {
  const pick = usePick();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {stochasticProcesses.map((s) => (
        <article key={s.id} className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-1 font-bold">{pick({ fa: s.fa, en: s.name })}</h3>
          <p className="mb-2 text-sm text-muted-foreground"><MixedText text={pick(s.def)} /></p>
          <div className="rounded-lg bg-muted/50 p-2" dir="ltr"><Math tex={s.related} display /></div>
          <p className="mt-2 text-xs text-muted-foreground"><MixedText text={pick(s.examples)} /></p>
        </article>
      ))}
    </div>
  );
}

export function ConjugatePriors() {
  const pick = usePick();
  return (
    <div className="atlas-scroll max-w-full overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="p-3 text-start">{pick({ fa: "درست‌نمایی", en: "Likelihood" })}</th>
            <th className="p-3 text-start">{pick({ fa: "پیشین", en: "Prior" })}</th>
            <th className="p-3 text-start">{pick({ fa: "پسین", en: "Posterior" })}</th>
            <th className="p-3 text-start" dir="ltr">{pick({ fa: "قاعده‌ی به‌روزرسانی", en: "Update rule" })}</th>
          </tr>
        </thead>
        <tbody>
          {conjugatePriors.map((c) => (
            <tr key={c.id} className="border-b border-border/60 last:border-0">
              <td className="p-3"><MixedText text={pick(c.likelihood)} /></td>
              <td className="p-3">{pick({ fa: c.priorFa, en: c.prior })}</td>
              <td className="p-3">{pick({ fa: c.posteriorFa, en: c.posterior })}</td>
              <td className="p-3 text-start" dir="ltr"><Math tex={c.update} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Quiz ---------- */
export function Quiz() {
  const pick = usePick();
  const t = useT();
  const { locale } = useI18n();
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = quizData[idx];

  const check = () => {
    if (selected === null) return;
    setChecked(true);
    if (selected === q.correct) setScore((s) => s + 1);
  };
  const next = () => {
    if (idx + 1 >= quizData.length) {
      setDone(true);
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
      setChecked(false);
    }
  };
  const restart = () => {
    setIdx(0);
    setSelected(null);
    setChecked(false);
    setScore(0);
    setDone(false);
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <div className="text-3xl font-black">{score} / {quizData.length}</div>
        <p className="mt-2 text-sm text-muted-foreground">{t("score")}</p>
        <button type="button" onClick={restart} className="mt-4 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90">
          ↻ {t("startQuiz")}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{idx + 1} / {quizData.length}</span>
        <span>{t("score")}: {score}</span>
      </div>
      <h3 className="mb-4 text-base font-bold"><MixedText text={pick(q.question)} /></h3>
      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={checked}
            onClick={() => setSelected(i)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg border p-3 text-start text-sm transition-colors",
              selected === i ? "border-foreground bg-muted" : "border-border bg-muted/30 hover:bg-muted",
              checked && i === q.correct && "border-emerald-500 bg-emerald-500/10",
              checked && i === selected && i !== q.correct && "border-rose-500 bg-rose-500/10",
            )}
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border text-[11px] font-bold">
              {String.fromCharCode(65 + i)}
            </span>
            <MixedText text={pick(opt)} />
          </button>
        ))}
      </div>
      {checked ? (
        <p className="mt-3 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          {selected === q.correct ? `✓ ${t("correct")}` : `✗ ${t("wrong")}`} — <MixedText text={pick(q.explanation)} />
        </p>
      ) : null}
      <div className="mt-4 flex gap-2">
        {!checked ? (
          <button type="button" onClick={check} disabled={selected === null} className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-40">
            {t("checkAnswer")}
          </button>
        ) : (
          <button type="button" onClick={next} className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90">
            {t("nextQuestion")} {locale === "fa" ? "←" : "→"}
          </button>
        )}
      </div>
    </div>
  );
}
