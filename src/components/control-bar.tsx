"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { LangToggle } from "@/components/lang-toggle";
import { fontScaleOptions, useFontScale } from "@/lib/font-scale";
import { cn } from "@/lib/utils";

export function ControlBar() {
  const { scale, setScale } = useFontScale();
  return (
    <div className="flex items-center gap-1.5">
      <div className="hidden items-center rounded-lg border border-border bg-background p-0.5 sm:flex">
        {fontScaleOptions.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setScale(o.value)}
            aria-label={`font size ${o.value}`}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-semibold transition-colors",
              scale === o.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      <LangToggle />
      <ThemeToggle />
    </div>
  );
}
