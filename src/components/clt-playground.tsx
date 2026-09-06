"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { distSpecs, makeRng, type DistId } from "@/lib/stats";
import { useI18n, useT } from "@/lib/i18n";

const SOURCES: DistId[] = ["normal", "exponential", "uniform" as DistId, "poisson", "cauchy"];
const SOURCE_IDS = ["normal", "exponential", "continuous-uniform", "poisson", "cauchy"] as DistId[];

export function CLTPlayground() {
  const t = useT();
  const { locale } = useI18n();
  const [srcId, setSrcId] = useState<DistId>("exponential");
  const [n, setN] = useState(5);
  const [numSamples, setNumSamples] = useState(2000);
  const [seed, setSeed] = useState(1);
  const [drawn, setDrawn] = useState<number[]>([]);

  const spec = distSpecs[srcId];

  const run = () => {
    const rng = makeRng(seed);
    const means: number[] = [];
    for (let s = 0; s < numSamples; s++) {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += spec.sample(specParams(srcId), rng);
      means.push(sum / n);
    }
    setDrawn(means);
  };

  const bins = useMemo(() => {
    if (drawn.length === 0) return [];
    const sorted = [...drawn].sort((a, b) => a - b);
    const lo = sorted[0];
    const hi = sorted[sorted.length - 1];
    const B = 32;
    const w = (hi - lo) / B || 1;
    const counts = new Array(B).fill(0);
    for (const v of drawn) {
      const idx = Math.min(B - 1, Math.max(0, Math.floor((v - lo) / w)));
      counts[idx] += 1;
    }
    // normalize to density
    const total = drawn.length * w;
    return counts.map((c, i) => ({
      x: lo + (i + 0.5) * w,
      density: c / total,
      count: c,
    }));
  }, [drawn]);

  const { mean, sd } = useMemo(() => {
    if (drawn.length === 0) return { mean: 0, sd: 1 };
    const m = drawn.reduce((a, b) => a + b, 0) / drawn.length;
    const v = drawn.reduce((a, b) => a + (b - m) ** 2, 0) / drawn.length;
    return { mean: m, sd: Math.sqrt(v) };
  }, [drawn]);

  // overlay normal curve with same mean/sd scaled to density bin width
  const w = bins.length > 1 ? bins[1].x - bins[0].x : 1;
  const normalCurve = bins.map((b) => ({
    ...b,
    normal:
      (1 / (sd * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * ((b.x - mean) / sd) ** 2),
  }));

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-muted-foreground">{t("sourceDist")}</span>
          <select
            value={srcId}
            onChange={(e) => setSrcId(e.target.value as DistId)}
            className="w-full rounded border border-border bg-background px-2 py-1.5"
            dir="ltr"
          >
            {SOURCE_IDS.map((id) => (
              <option key={id} value={id}>
                {distSpecs[id].label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 flex items-center justify-between text-muted-foreground">
            <span>{t("sampleSize")} (n)</span>
            <span className="font-mono" dir="ltr">{n}</span>
          </span>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={n}
            onChange={(e) => setN(parseInt(e.target.value))}
            dir="ltr"
            className="w-full"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 flex items-center justify-between text-muted-foreground">
            <span>{t("numSamples")}</span>
            <span className="font-mono" dir="ltr">{numSamples}</span>
          </span>
          <input
            type="range"
            min={100}
            max={10000}
            step={100}
            value={numSamples}
            onChange={(e) => setNumSamples(parseInt(e.target.value))}
            dir="ltr"
            className="w-full"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 flex items-center justify-between text-muted-foreground">
            <span>{t("seed")}</span>
            <span className="font-mono" dir="ltr">{seed}</span>
          </span>
          <input
            type="range"
            min={1}
            max={999}
            step={1}
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value))}
            dir="ltr"
            className="w-full"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={run}
        className="mt-3 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
      >
        {t("draw")} {locale === "fa" ? "←" : "→"}
      </button>

      {bins.length > 0 ? (
        <div className="mt-4">
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={normalCurve} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in oklch, var(--foreground) 12%, transparent)" />
                <XAxis dataKey="x" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} type="number" domain={["dataMin", "dataMax"]} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="density" fill="var(--accent-teal)" fillOpacity={0.5} isAnimationActive={false} name={t("empirical")} />
                <Line type="monotone" dataKey="normal" stroke="var(--accent-rose)" strokeWidth={2} dot={false} isAnimationActive={false} name={t("normalCurve")} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground" dir="ltr">
            <span>{t("sampleMean")} <span className="font-mono">{mean.toFixed(3)}</span></span>
            <span>{t("sampleSd")} <span className="font-mono">{sd.toFixed(3)}</span></span>
            <span>{t("theoreticalMean")}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function specParams(id: DistId): Record<string, number> {
  const p: Record<string, number> = {};
  distSpecs[id].params.forEach((pr) => (p[pr.name] = pr.init));
  return p;
}
