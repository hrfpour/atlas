"use client";

import { useEffect, useState } from "react";

/**
 * Scrollspy: returns the id of the section currently in view.
 * Pass the list of section ids to observe.
 */
export function useScrollSpy(ids: string[], offset = 120): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    const handler = () => {
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // section is considered active once its top crosses the offset line
        if (rect.top <= offset) {
          current = id;
        } else {
          break;
        }
      }
      if (current) setActive(current);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, [ids, offset]);

  return active;
}
