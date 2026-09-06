"use client";

import { Math } from "@/components/math";
import { MixedText } from "@/components/mixed-text";
import { distributionsById } from "@/data/distributions";
import { relationships, relationshipTypeMeta } from "@/data/relationships";
import { useI18n, usePick, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function RelationshipCard({ r }: { r: (typeof relationships)[number] }) {
  const pick = usePick();
  const { locale } = useI18n();
  const from = distributionsById[r.from];
  const to = distributionsById[r.to];
  const meta = relationshipTypeMeta[r.type];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{
            backgroundColor: `color-mix(in oklch, ${meta.color} 16%, transparent)`,
            color: `color-mix(in oklch, ${meta.color} 65%, var(--foreground))`,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
          {pick({ fa: meta.fa, en: meta.en })}
        </span>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <NodeChip name={from.name} fa={from.fa} accent={from.accent} id={from.id} />
        {/* Arrow always points from `from` to `to`. In RTL `from` sits on the
            right so the arrow points left (←); in LTR `from` sits on the left
            so the arrow points right (→). */}
        <span className="select-none text-muted-foreground" aria-hidden>
          {locale === "fa" ? "←" : "→"}
        </span>
        <NodeChip name={to.name} fa={to.fa} accent={to.accent} id={to.id} />
      </div>

      <div className="mb-3 rounded-lg bg-muted/50 p-3">
        <Math tex={r.formula} display />
      </div>

      <p className="mt-auto text-sm leading-relaxed text-muted-foreground">
        <MixedText text={pick(r.desc)} />
      </p>
    </article>
  );
}

function NodeChip({ name, fa, accent, id }: { name: string; fa: string; accent: string; id: string }) {
  const pick = usePick();
  const color =
    accent === "emerald" ? "var(--accent-emerald)" : "var(--accent-amber)";
  return (
    <a
      href={`#dist-${id}`}
      className="rounded-lg border px-2.5 py-1 text-center transition-transform hover:scale-[1.03]"
      style={{
        borderColor: `color-mix(in oklch, ${color} 40%, var(--border))`,
        backgroundColor: `color-mix(in oklch, ${color} 10%, var(--card))`,
      }}
    >
      <span className="block text-xs font-bold leading-tight text-foreground">{name}</span>
      <span className="block text-[10px] text-muted-foreground">{pick({ fa, en: name })}</span>
    </a>
  );
}

export function RelationshipFilter({
  types,
  active,
  onChange,
}: {
  types: (keyof typeof relationshipTypeMeta)[];
  active: string;
  onChange: (t: string) => void;
}) {
  const pick = usePick();
  const t = useT();
  return (
    <div className="flex flex-wrap gap-2">
      <FilterChip active={active === "all"} onClick={() => onChange("all")} label={t("filterAll")} />
      {types.map((ty) => {
        const meta = relationshipTypeMeta[ty];
        return (
          <FilterChip
            key={ty}
            active={active === ty}
            onClick={() => onChange(ty)}
            label={pick({ fa: meta.fa, en: meta.en })}
            color={meta.color}
          />
        );
      })}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-foreground/30 bg-foreground text-background"
          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
      )}
      style={active && color ? { backgroundColor: color, borderColor: color, color: "white" } : undefined}
    >
      {label}
    </button>
  );
}
