"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";

/**
 * Keeps <html lang/dir> in sync with the chosen locale, AND preserves the
 * user's scroll position across the language switch.
 *
 * Changing `dir` causes the browser to reflow the whole document and
 * normally jumps the viewport. To keep the user where they are, we:
 *   1. record the element that is currently at the top of the viewport
 *      (and its pixel offset), before flipping `dir`;
 *   2. flip `dir`/`lang`;
 *   3. after a double-rAF (which lets the browser lay out the new flow),
 *      scroll that same element back to the same offset.
 */
export function LocaleController() {
  const locale = useI18n((s) => s.locale);
  const prevLocale = useRef(locale);

  useEffect(() => {
    const prev = prevLocale.current;
    if (prev !== locale) {
      // 1. remember which element is at the viewport top + its offset
      const topY = window.scrollY;
      let anchor: Element | null = null;
      let anchorOffset = 0;
      // find the element whose top is closest to (but <=) the viewport top
      const all = document.querySelectorAll(
        "section, header, footer, main > div, article",
      );
      let best: { el: Element; offset: number } | null = null;
      all.forEach((el) => {
        const r = el.getBoundingClientRect();
        const absTop = r.top + window.scrollY;
        if (absTop <= topY + 80) {
          if (!best || absTop > best.offset) {
            best = { el, offset: absTop };
          }
        }
      });
      if (best) {
        anchor = best.el;
        anchorOffset = topY - best.offset;
      }

      // 2. flip dir/lang
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";

      // 3. restore scroll after the reflow settles (double rAF + a microtask)
      const restore = () => {
        if (anchor) {
          const r = anchor.getBoundingClientRect();
          const target = r.top + window.scrollY + anchorOffset;
          window.scrollTo(0, target);
        } else {
          window.scrollTo(0, topY);
        }
      };
      // double rAF so layout from the dir flip is committed first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          restore();
          // one more pass after a microtask in case fonts/content shift
          setTimeout(restore, 0);
        });
      });
    } else {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
    }
    prevLocale.current = locale;
  }, [locale]);

  return null;
}
