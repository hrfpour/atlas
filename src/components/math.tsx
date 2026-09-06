"use client";

import katex from "katex";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

type MathProps = {
  tex: string;
  display?: boolean;
  className?: string;
};

/**
 * Render LaTeX via KaTeX. Math is always LTR even inside an RTL document.
 */
export function Math({ tex, display = false, className }: MathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode: display,
        throwOnError: false,
        strict: false,
        trust: true,
        output: "html",
      });
    } catch {
      return tex;
    }
  }, [tex, display]);

  return (
    <span
      dir="ltr"
      className={cn(display && "block", "math-inline", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
