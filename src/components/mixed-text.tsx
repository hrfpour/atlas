"use client";

import { Math } from "@/components/math";

/**
 * Render a string that may contain inline LaTeX delimited by `$...$`.
 * Text outside the delimiters is rendered as-is (Persian-aware). Math
 * segments are rendered LTR via KaTeX.
 */
export function MixedText({ text }: { text: string }) {
  const parts = text.split("$");
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          return <Math key={i} tex={part} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
