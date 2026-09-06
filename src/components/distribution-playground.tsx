"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { distSpecs, type DistId, type DistParams } from "@/lib/stats";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

type Layer = { id: DistId; params: DistParams; color: string };

const COLORS = [
  "var(--accent-emerald)",
  "var(--accent-amber)",
  "var(--accent-rose)",
  "var(--accent-teal)",
  "var(--accent-violet)",
];

const ALL_IDS = Object.keys(distSpecs) as DistId[];

export function DistributionPlayground() {
  const t = useT();
  const [layers, setLayers] = useState<Layer[]>([
    { id: "normal", params: { mu: 0, sigma: 1 }, color: COLORS[0] },
  ]);

  const points = useMemo(() => {
    // build a shared x-axis across the union of all layer domains
    const lo = Math.min(...layers.map((l) => distSpecs[l.id].domain[0]));
    const hi = Math.max(...layers.map((l) => distSpecs[l.id].domain[1]));
    const N = 240;
    const discrete = layers.some((l) => distSpecs[l.id].discrete);
    const xs: number[] = [];
    if (discrete) {
      const a = Math.floor(lo);
      const b = Math.ceil(hi);
      for (let k = a; k <= b; k++) xs.push(k);
    } else {
      for (let i = 0; i <= N; i++) xs.push(lo + ((hi - lo) * i) / N);
    }
    return xs.map((x) => {
      const row: Record<string, number> = { x };
      layers.forEach((l, idx) => {
        row[`d${idx}`] = distSpecs[l.id].pdf(x, l.params);
      });
      return row;
    });
  }, [layers]);

  const addLayer = (id: DistId) => {
    const spec = distSpecs[id];
    const params: DistParams = {};
    spec.params.forEach((p) => (params[p.name] = p.init));
    setLayers((ls) => [...ls, { id, params, color: COLORS[ls.length % COLORS.length] }]);
  };

  const updateParam = (idx: number, name: string, value: number) =>
    setLayers((ls) =>
      ls.map((l, i) => (i === idx ? { ...l, params: { ...l.params, [name]: value } } : l)),
    );

  const removeLayer = (idx: number) => setLayers((ls) => ls.filter((_, i) => i !== idx));

  const Chart = layers.some((l) => distSpecs[l.id].discrete)
    ? LineChart
    : AreaChart;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      {/* chart */}
      <div className="h-72 w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={points} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in oklch, var(--foreground) 12%, transparent)" />
            <XAxis
              dataKey="x"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              type="number"
              domain={["dataMin", "dataMax"]}
            />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            {layers.map((l, idx) =>
              layers.some((ll) => distSpecs[ll.id].discrete) ? (
                <Line
                  key={idx}
                  type="monotone"
                  dataKey={`d${idx}`}
                  stroke={l.color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: l.color }}
                  isAnimationActive={false}
                  name={distSpecs[l.id].label}
                />
              ) : (
                <Area
                  key={idx}
                  type="monotone"
                  dataKey={`d${idx}`}
                  stroke={l.color}
                  fill={l.color}
                  fillOpacity={0.15}
                  strokeWidth={2}
                  isAnimationActive={false}
                  name={distSpecs[l.id].label}
                />
              ),
            )}
          </Chart>
        </ResponsiveContainer>
      </div>

      {/* layer controls */}
      <div className="mt-4 space-y-3">
        {layers.map((l, idx) => {
          const spec = distSpecs[l.id];
          return (
            <div key={idx} className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: l.color }} />
                  <select
                    value={l.id}
                    onChange={(e) => {
                      const newId = e.target.value as DistId;
                      const np: DistParams = {};
                      distSpecs[newId].params.forEach((p) => (np[p.name] = p.init));
                      setLayers((ls) => ls.map((x, i) => (i === idx ? { ...x, id: newId, params: np } : x)));
                    }}
                    className="rounded border border-border bg-background px-2 py-1 text-sm font-semibold"
                  >
                    {ALL_IDS.map((id) => (
                      <option key={id} value={id}>
                        {distSpecs[id].label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeLayer(idx)}
                  className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={t("remove")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {spec.params.map((p) => (
                  <div key={p.name} className="flex items-center gap-2">
                    <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground" dir="ltr">
                      {p.name}
                    </span>
                    <input
                      type="range"
                      min={p.min}
                      max={p.max}
                      step={p.step}
                      value={l.params[p.name]}
                      onChange={(e) => updateParam(idx, p.name, parseFloat(e.target.value))}
                      className="flex-1"
                      dir="ltr"
                    />
                    <span className="w-12 text-end font-mono text-xs" dir="ltr">
                      {Number(l.params[p.name]).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                <span>{t("mean")}: <span className="font-mono" dir="ltr">{spec.mean(l.params).toFixed(3)}</span></span>
                <span>{t("variance")}: <span className="font-mono" dir="ltr">{spec.variance(l.params).toFixed(3)}</span></span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => addLayer("normal")}
        className={cn(
          "mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        )}
      >
        <Plus className="h-4 w-4" /> {t("addDist")}
      </button>
    </div>
  );
}
