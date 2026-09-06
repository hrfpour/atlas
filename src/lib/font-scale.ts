"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect } from "react";

export type FontScale = "sm" | "md" | "lg" | "xl";

const factor: Record<FontScale, string> = {
  sm: "15px",
  md: "16px",
  lg: "18px",
  xl: "20px",
};

type FontState = {
  scale: FontScale;
  setScale: (s: FontScale) => void;
};

export const useFontScale = create<FontState>()(
  persist(
    (set) => ({
      scale: "md",
      setScale: (s) => set({ scale: s }),
    }),
    { name: "atlas-font-scale" },
  ),
);

export function FontScaleController() {
  const scale = useFontScale((s) => s.scale);
  useEffect(() => {
    document.documentElement.style.fontSize = factor[scale];
  }, [scale]);
  return null;
}

export const fontScaleOptions: { value: FontScale; label: string }[] = [
  { value: "sm", label: "A−" },
  { value: "md", label: "A" },
  { value: "lg", label: "A+" },
  { value: "xl", label: "A++" },
];
