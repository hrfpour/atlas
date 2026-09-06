"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { distributions } from "@/data/distributions";
import { usePick, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SearchBox({ onSelect }: { onSelect?: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const pick = usePick();
  const t = useT();

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return distributions
      .filter((d) => {
        const hay = [
          d.id,
          d.name,
          d.fa,
          pick(d.desc),
          pick(d.notes),
          pick(d.example),
          d.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(term);
      })
      .slice(0, 8);
  }, [q, pick]);

  const go = (id: string) => {
    const el = document.getElementById(`dist-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    onSelect?.(id);
    setOpen(false);
    setQ("");
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          type="search"
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-lg border border-border bg-background py-2 pe-9 ps-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          dir="auto"
        />
        {q ? (
          <button
            type="button"
            onClick={() => setQ("")}
            className="absolute end-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {open && results.length > 0 ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {results.map((d) => (
            <button
              key={d.id}
              type="button"
              onMouseDown={() => go(d.id)}
              className={cn(
                "flex w-full items-center justify-between gap-2 border-b border-border px-3 py-2 text-start text-sm last:border-0 hover:bg-muted",
              )}
            >
              <span className="font-semibold">{d.name}</span>
              <span className="text-xs text-muted-foreground">{d.fa}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
