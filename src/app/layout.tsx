import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/lib/theme";
import { FontScaleController } from "@/lib/font-scale";
import { LocaleController } from "@/components/locale-controller";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "Atlas of Statistical Distributions — اطلس توزیع‌های آماری",
  description:
    "A complete, bilingual reference of probability distributions and their relationships: density, moments, transformations, interactive playground and AI assistant.",
  keywords: [
    "probability distributions",
    "توزیع آماری",
    "statistics",
    "آمار",
    "normal",
    "نرمال",
    "poisson",
    "پواسون",
  ],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} font-vazir antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <FontScaleController />
          <LocaleController />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
