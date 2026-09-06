"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="flex items-center rounded-lg border border-border bg-background p-0.5 text-xs font-semibold">
      <button
        type="button"
        onClick={() => setLocale("fa")}
        className={cn(
          "rounded-md px-2 py-1 transition-colors",
          locale === "fa"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        فا
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-md px-2 py-1 transition-colors",
          locale === "en"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        EN
      </button>
    </div>
  );
}
