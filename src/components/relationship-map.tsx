"use client";

import { useMemo, useState } from "react";
import { distributionsById } from "@/data/distributions";
import { relationships, relationshipTypeMeta, type RelationshipType } from "@/data/relationships";
import { useI18n, useT } from "@/lib/i18n";

type NodePos = { id: string; x: number; y: number };

// Layered column layout on a 1240 x 980 viewBox covering all 44 distributions.
// Columns left→right: discrete-bernoulli-family, generator/gamma, normal-hub, extreme/derived, multivariate.
const NODES: NodePos[] = [
  // Col 1 (x=110): discrete Bernoulli family
  { id: "rademacher", x: 110, y: 50 },
  { id: "bernoulli", x: 110, y: 110 },
  { id: "binomial", x: 110, y: 180 },
  { id: "multinomial", x: 110, y: 250 },
  { id: "beta-binomial", x: 110, y: 320 },
  { id: "hypergeometric", x: 110, y: 390 },
  { id: "discrete-uniform", x: 110, y: 460 },
  { id: "geometric", x: 110, y: 530 },
  { id: "negative-binomial", x: 110, y: 600 },
  { id: "poisson", x: 110, y: 670 },
  { id: "skellam", x: 110, y: 740 },
  // Col 2 (x=345): generator + exponential/gamma hub
  { id: "continuous-uniform", x: 345, y: 50 },
  { id: "triangular", x: 345, y: 120 },
  { id: "exponential", x: 345, y: 270 },
  { id: "laplace", x: 345, y: 340 },
  { id: "gamma", x: 345, y: 460 },
  { id: "erlang", x: 345, y: 530 },
  { id: "inverse-gamma", x: 345, y: 600 },
  { id: "levy", x: 345, y: 670 },
  { id: "pareto", x: 345, y: 740 },
  // Col 3 (x=580): normal hub + chi-square/t/f
  { id: "folded-normal", x: 580, y: 50 },
  { id: "half-normal", x: 580, y: 120 },
  { id: "skew-normal", x: 580, y: 190 },
  { id: "normal", x: 580, y: 290 },
  { id: "truncated-normal", x: 580, y: 360 },
  { id: "lognormal", x: 580, y: 430 },
  { id: "chi-square", x: 580, y: 530 },
  { id: "student-t", x: 580, y: 600 },
  { id: "f-distribution", x: 580, y: 670 },
  { id: "cauchy", x: 580, y: 740 },
  // Col 4 (x=815): positive/derived
  { id: "maxwell-boltzmann", x: 815, y: 50 },
  { id: "rayleigh", x: 815, y: 120 },
  { id: "weibull", x: 815, y: 190 },
  { id: "inverse-gaussian", x: 815, y: 260 },
  { id: "logistic", x: 815, y: 340 },
  { id: "beta", x: 815, y: 430 },
  { id: "beta-prime", x: 815, y: 500 },
  // Col 5 (x=1050): extreme value + multivariate
  { id: "gumbel", x: 1050, y: 50 },
  { id: "gev", x: 1050, y: 120 },
  { id: "frechet", x: 1050, y: 190 },
  { id: "zipf", x: 1050, y: 260 },
  { id: "benford", x: 1050, y: 330 },
  { id: "dirichlet", x: 1050, y: 460 },
  { id: "multivariate-normal", x: 1050, y: 530 },
];

const NODE_W = 150;
const NODE_H = 38;

const nodeById = Object.fromEntries(NODES.map((n) => [n.id, n]));
const mapEdges = relationships.filter((r) => nodeById[r.from] && nodeById[r.to]);

function edgePath(a: NodePos, b: NodePos): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const len = Math.hypot(dx, dy) || 1;
  const off = Math.min(50, len * 0.16);
  const cx = mx + (-dy / len) * off;
  const cy = my + (dx / len) * off;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

export function RelationshipMap() {
  const [active, setActive] = useState<string | null>(null);
  const t = useT();
  const { locale } = useI18n();

  const connected = useMemo(() => {
    if (!active) return null;
    const set = new Set<string>([active]);
    for (const r of mapEdges) {
      if (r.from === active) set.add(r.to);
      if (r.to === active) set.add(r.from);
    }
    return set;
  }, [active]);

  const isDim = (id: string) => connected !== null && !connected.has(id);

  const scrollTo = (id: string) => {
    const el = document.getElementById(`dist-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative w-full">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(Object.keys(relationshipTypeMeta) as RelationshipType[]).map((ty) => {
          const meta = relationshipTypeMeta[ty];
          const label = locale === "fa" ? meta.fa : meta.en;
          return (
            <span key={ty} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
              {label}
            </span>
          );
        })}
      </div>

      <div className="atlas-scroll max-w-full overflow-x-auto rounded-xl border border-border bg-card/50 p-2">
        <div className="min-w-0">
          <svg viewBox="0 0 1240 800" className="block min-w-[960px] w-full" role="img" aria-label={t("mapTitle")}>
          <defs>
            <pattern id="map-dots" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" className="fill-foreground/10" />
            </pattern>
          </defs>
          <rect width="1240" height="800" fill="url(#map-dots)" />

          {/* Edges */}
          <g fill="none" strokeWidth={1.6} strokeLinecap="round">
            {mapEdges.map((r) => {
              const a = nodeById[r.from];
              const b = nodeById[r.to];
              const color = relationshipTypeMeta[r.type].color;
              const lit = active === null || r.from === active || r.to === active;
              return (
                <path
                  key={r.id}
                  d={edgePath(a, b)}
                  stroke={color}
                  strokeOpacity={lit ? 0.85 : 0.1}
                  strokeWidth={lit ? 2.2 : 1.2}
                  className={lit && active ? "flow-line" : undefined}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {NODES.map((n) => {
              const d = distributionsById[n.id];
              if (!d) return null;
              const dim = isDim(n.id);
              const w = d.name.length > 18 ? NODE_W + 30 : d.name.length > 13 ? NODE_W + 12 : NODE_W;
              const x = n.x - w / 2;
              const y = n.y - NODE_H / 2;
              const isDisc = d.category === "discrete";
              const fill = isDisc
                ? "color-mix(in oklch, var(--accent-emerald) 16%, var(--card))"
                : "color-mix(in oklch, var(--accent-amber) 16%, var(--card))";
              return (
                <g
                  key={n.id}
                  onMouseEnter={() => setActive(n.id)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(n.id)}
                  onBlur={() => setActive(null)}
                  onClick={() => scrollTo(n.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      scrollTo(n.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={d.name}
                  className="cursor-pointer outline-none"
                  opacity={dim ? 0.3 : 1}
                >
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={NODE_H}
                    rx={9}
                    fill={fill}
                    stroke={active === n.id ? "var(--foreground)" : "color-mix(in oklch, var(--foreground) 22%, transparent)"}
                    strokeWidth={active === n.id ? 1.8 : 1}
                  />
                  <text
                    x={n.x}
                    y={n.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground"
                    style={{
                      fontSize: d.name.length > 18 ? 9.5 : d.name.length > 13 ? 10.5 : 12,
                      fontFamily: "var(--font-geist-sans), sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {d.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
        </div>
      </div>
    </div>
  );
}
