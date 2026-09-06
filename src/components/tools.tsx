"use client";

import { useMemo, useState } from "react";
import { distSpecs, makeRng, sampleMoments, type DistId } from "@/lib/stats";
import { useT } from "@/lib/i18n";
import { CopyButton } from "@/components/copy-button";
import { Download } from "lucide-react";

const IDS = Object.keys(distSpecs) as DistId[];

function paramsOf(id: DistId): Record<string, number> {
  const p: Record<string, number> = {};
  distSpecs[id].params.forEach((pr) => (p[pr.name] = pr.init));
  return p;
}

export function ProbabilityCalculator() {
  const t = useT();
  const [id, setId] = useState<DistId>("normal");
  const [params, setParams] = useState<Record<string, number>>(paramsOf("normal"));
  const [x, setX] = useState(0);
  const spec = distSpecs[id];

  const cdf = spec.cdf(x, params);
  const pdf = spec.pdf(x, params);
  const pLess = cdf;
  const pGreater = 1 - cdf;
  const q95 = spec.quantile(0.95, params);

  const onSelect = (newId: DistId) => {
    setId(newId);
    setParams(paramsOf(newId));
    setX(distSpecs[newId].domain[0] + 1);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <select
          value={id}
          onChange={(e) => onSelect(e.target.value as DistId)}
          className="rounded border border-border bg-background px-2 py-1.5 text-sm font-semibold"
          dir="ltr"
        >
          {IDS.map((i) => (
            <option key={i} value={i}>
              {distSpecs[i].label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {spec.params.map((p) => (
          <label key={p.name} className="text-xs">
            <span className="mb-1 flex justify-between text-muted-foreground" dir="ltr">
              <span className="font-mono">{p.name}</span>
              <span className="font-mono">{params[p.name].toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={p.min}
              max={p.max}
              step={p.step}
              value={params[p.name]}
              onChange={(e) => setParams({ ...params, [p.name]: parseFloat(e.target.value) })}
              dir="ltr"
              className="w-full"
            />
          </label>
        ))}
      </div>

      <label className="mt-3 block text-sm">
        <span className="mb-1 block text-muted-foreground">x</span>
        <input
          type="number"
          value={x}
          onChange={(e) => setX(parseFloat(e.target.value) || 0)}
          step="0.1"
          className="w-full rounded border border-border bg-background px-2 py-1.5 font-mono"
          dir="ltr"
        />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <Result label={`${t("pdf")} / PMF`} value={pdf.toFixed(5)} />
        <Result label={`P(X ≤ ${x})`} value={pLess.toFixed(5)} />
        <Result label={`P(X > ${x})`} value={pGreater.toFixed(5)} />
        <Result label={t("mean")} value={spec.mean(params).toFixed(4)} />
        <Result label={t("variance")} value={spec.variance(params).toFixed(4)} />
        <Result label="q₀.₉₅" value={q95.toFixed(4)} />
      </div>
    </div>
  );
}

export function SampleGenerator() {
  const t = useT();
  const [id, setId] = useState<DistId>("normal");
  const [params, setParams] = useState<Record<string, number>>(paramsOf("normal"));
  const [n, setN] = useState(100);
  const [seed, setSeed] = useState(7);
  const [samples, setSamples] = useState<number[]>([]);
  const spec = distSpecs[id];

  const generate = () => {
    const rng = makeRng(seed);
    const arr = Array.from({ length: n }, () => spec.sample(params, rng));
    setSamples(arr);
  };

  const stats = useMemo(() => (samples.length ? sampleMoments(samples) : null), [samples]);

  const csv = useMemo(() => {
    if (!samples.length) return "";
    return ["index,value", ...samples.map((v, i) => `${i + 1},${v.toFixed(6)}`)].join("\n");
  }, [samples]);

  const download = () => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}-samples.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onSelect = (newId: DistId) => {
    setId(newId);
    setParams(paramsOf(newId));
    setSamples([]);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <select
          value={id}
          onChange={(e) => onSelect(e.target.value as DistId)}
          className="rounded border border-border bg-background px-2 py-1.5 text-sm font-semibold"
          dir="ltr"
        >
          {IDS.map((i) => (
            <option key={i} value={i}>
              {distSpecs[i].label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {spec.params.map((p) => (
          <label key={p.name} className="text-xs">
            <span className="mb-1 flex justify-between text-muted-foreground" dir="ltr">
              <span className="font-mono">{p.name}</span>
              <span className="font-mono">{params[p.name].toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={p.min}
              max={p.max}
              step={p.step}
              value={params[p.name]}
              onChange={(e) => setParams({ ...params, [p.name]: parseFloat(e.target.value) })}
              dir="ltr"
              className="w-full"
            />
          </label>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="text-xs">
          <span className="mb-1 flex justify-between text-muted-foreground" dir="ltr">
            <span>{t("sampleSize")}</span>
            <span className="font-mono">{n}</span>
          </span>
          <input type="range" min={10} max={1000} step={10} value={n} onChange={(e) => setN(parseInt(e.target.value))} dir="ltr" className="w-full" />
        </label>
        <label className="text-xs">
          <span className="mb-1 flex justify-between text-muted-foreground" dir="ltr">
            <span>seed</span>
            <span className="font-mono">{seed}</span>
          </span>
          <input type="range" min={1} max={999} step={1} value={seed} onChange={(e) => setSeed(parseInt(e.target.value))} dir="ltr" className="w-full" />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={generate} className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90">
          {t("draw")}
        </button>
        {samples.length > 0 ? (
          <>
            <button type="button" onClick={download} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
              <Download className="h-4 w-4" /> {t("downloadCsv")}
            </button>
            <CopyButton text={csv} label={t("copy")} />
          </>
        ) : null}
      </div>

      {stats ? (
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <Result label={t("mean")} value={stats.mean.toFixed(4)} />
          <Result label={t("variance")} value={stats.variance.toFixed(4)} />
          <Result label={t("skewness")} value={stats.skewness.toFixed(4)} />
          <Result label={t("kurtosis")} value={stats.kurtosis.toFixed(4)} />
          <Result label="min" value={Math.min(...samples).toFixed(4)} />
          <Result label="max" value={Math.max(...samples).toFixed(4)} />
        </div>
      ) : null}

      {samples.length > 0 ? (
        <div dir="ltr" className="atlas-scroll mt-3 max-h-40 overflow-auto rounded bg-muted/40 p-2 font-mono text-[11px] leading-relaxed">
          {samples.slice(0, 100).map((v, i) => (
            <span key={i} className="ms-2">
              {v.toFixed(3)}
            </span>
          ))}
          {samples.length > 100 ? <span className="ms-2 text-muted-foreground">…</span> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Lightweight method-of-moments distribution fitter from a pasted list of numbers. */
export function DistributionFitter() {
  const t = useT();
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<{ id: DistId; params: Record<string, number>; score: number } | null>(null);

  const fit = () => {
    const xs = raw
      .split(/[\s,;\n]+/)
      .map((s) => parseFloat(s))
      .filter((v) => isFinite(v));
    if (xs.length < 5) return;
    const m = sampleMoments(xs);
    const candidates: { id: DistId; params: Record<string, number>; score: number }[] = [];
    const positive = xs.every((x) => x > 0);

    // Normal: mu=mean, sigma=sd
    candidates.push({
      id: "normal",
      params: { mu: m.mean, sigma: m.sd },
      score: fitScore(xs, "normal", { mu: m.mean, sigma: m.sd }, m),
    });
    if (positive && m.mean > 0) {
      // Exponential: lambda = 1/mean
      candidates.push({
        id: "exponential",
        params: { lambda: 1 / m.mean },
        score: fitScore(xs, "exponential", { lambda: 1 / m.mean }, m),
      });
      // Gamma: method of moments
      if (m.variance > 0) {
        const alpha = (m.mean * m.mean) / m.variance;
        const beta = m.mean / m.variance;
        if (alpha > 0 && beta > 0)
          candidates.push({
            id: "gamma",
            params: { alpha, beta },
            score: fitScore(xs, "gamma", { alpha, beta }, m),
          });
      }
      // Lognormal: fit on log(data)
      const logs = xs.map(Math.log);
      const lm = sampleMoments(logs);
      candidates.push({
        id: "lognormal",
        params: { mu: lm.mean, sigma: lm.sd },
        score: fitScore(xs, "lognormal", { mu: lm.mean, sigma: lm.sd }, m),
      });
    }
    // Uniform: a=min, b=max
    candidates.push({
      id: "continuous-uniform",
      params: { a: Math.min(...xs), b: Math.max(...xs) },
      score: fitScore(xs, "continuous-uniform", { a: Math.min(...xs), b: Math.max(...xs) }, m),
    });

    candidates.sort((a, b) => a.score - b.score);
    setResult(candidates[0]);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="mb-3 text-xs text-muted-foreground">
        {t("fitterPasteHelp")}
      </p>
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        dir="ltr"
        placeholder="1.2 0.8 1.5 2.1 0.9 ..."
        className="atlas-scroll h-24 w-full rounded border border-border bg-background p-2 font-mono text-xs"
      />
      <button type="button" onClick={fit} className="mt-2 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90">
        {t("fit")}
      </button>
      {result ? (
        <div className="mt-3 rounded-lg bg-muted/40 p-3 text-sm">
          <div className="mb-1 font-semibold">
            {t("fitterBestFit")}: <span dir="ltr">{distSpecs[result.id].label}</span>
          </div>
          <div className="text-xs text-muted-foreground" dir="ltr">
            {t("fitterParams")}: {Object.entries(result.params).map(([k, v]) => `${k}=${v.toFixed(3)}`).join(", ")}
          </div>
          <div className="mt-1 text-xs text-muted-foreground" dir="ltr">
            {t("fitterScore")} {result.score.toFixed(4)} {t("fitterLowerBetter")}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function fitScore(
  xs: number[],
  id: DistId,
  params: Record<string, number>,
  m: { mean: number; sd: number; variance: number },
): number {
  const spec = distSpecs[id];
  const sorted = [...xs].sort((a, b) => a - b);
  const n = sorted.length;
  // empirical CDF vs model CDF -> max KS distance
  let ks = 0;
  for (let i = 0; i < n; i++) {
    const emp = (i + 1) / n;
    const mod = spec.cdf(sorted[i], params);
    ks = Math.max(ks, Math.abs(emp - mod));
  }
  // penalize moment mismatch lightly
  const meanErr = Math.abs(spec.mean(params) - m.mean) / (m.sd || 1);
  return ks + 0.1 * meanErr;
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-2 text-center">
      <div className="text-[10px] font-semibold text-muted-foreground">{label}</div>
      <div className="font-mono text-sm" dir="ltr">
        {value}
      </div>
    </div>
  );
}
