"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { translations, type Locale, type TranslationKey } from "@/lib/dictionary";

type I18nState = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
};

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: "fa",
      setLocale: (l) => set({ locale: l }),
      toggle: () => set({ locale: get().locale === "fa" ? "en" : "fa" }),
    }),
    { name: "atlas-locale" },
  ),
);

export function t(key: TranslationKey): string {
  // read directly from store snapshot; safe on client
  const locale = useI18n.getState().locale;
  return translations[locale][key] ?? translations.en[key] ?? key;
}

export function useT() {
  const locale = useI18n((s) => s.locale);
  return (key: TranslationKey) => translations[locale][key] ?? translations.en[key] ?? key;
}

export function useDir() {
  const locale = useI18n((s) => s.locale);
  return locale === "fa" ? "rtl" : "ltr";
}

/** Pick a field from a bilingual object based on current locale. */
export function usePick() {
  const locale = useI18n((s) => s.locale);
  return <T,>(obj: { fa: T; en: T }): T => obj[locale];
}
