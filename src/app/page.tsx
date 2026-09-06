"use client";

import { useMemo, useState } from "react";
import { distributions } from "@/data/distributions";
import {
  relationships,
  relationshipTypeMeta,
  type RelationshipType,
} from "@/data/relationships";
import { Math } from "@/components/math";
import { MixedText } from "@/components/mixed-text";
import { DistributionCard } from "@/components/distribution-card";
import {
  RelationshipCard,
  RelationshipFilter,
} from "@/components/relationship-card";
import { RelationshipMap } from "@/components/relationship-map";
import { ControlBar } from "@/components/control-bar";
import { SearchBox } from "@/components/search-box";
import { DistributionPlayground } from "@/components/distribution-playground";
import { CLTPlayground } from "@/components/clt-playground";
import {
  ProbabilityCalculator,
  SampleGenerator,
  DistributionFitter,
} from "@/components/tools";
import { Chatbot } from "@/components/chatbot";
import { Feedback } from "@/components/feedback";
import {
  ComparisonSelector,
  Glossary,
  Foundations,
  Inequalities,
  Inference,
  StochasticProcesses,
  ConjugatePriors,
  Quiz,
} from "@/components/education";
import { useFavorites } from "@/lib/favorites";
import { usePick, useT, useI18n } from "@/lib/i18n";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { cn } from "@/lib/utils";

type Cat = "all" | "discrete" | "continuous" | "favorites" | string;

export default function Home() {
  const t = useT();
  const pick = usePick();
  const { locale } = useI18n();
  const [cat, setCat] = useState<Cat>("all");
  const [relType, setRelType] = useState<string>("all");
  const fav = useFavorites();

  const types = Object.keys(relationshipTypeMeta) as RelationshipType[];

  const visibleDists = useMemo(() => {
    if (cat === "favorites") return distributions.filter((d) => fav.ids.includes(d.id));
    if (cat === "all") return distributions;
    return distributions.filter((d) => d.category === cat);
  }, [cat, fav.ids]);

  const visibleRels = useMemo(
    () => (relType === "all" ? relationships : relationships.filter((r) => r.type === relType)),
    [relType],
  );

  const nDiscrete = distributions.filter((d) => d.category === "discrete").length;
  const nContinuous = distributions.filter((d) => d.category === "continuous").length;

  const sectionIds = ["map", "distributions", "playground", "tools", "relationships", "comparison", "education", "chat", "feedback"];
  const activeSection = useScrollSpy(sectionIds);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ===== Top nav ===== */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <a href="#top" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background font-bold">Σ</span>
            <span className="text-sm font-bold leading-tight">
              {t("brand")}
              <span className="block text-[10px] font-normal text-muted-foreground">{t("brandSub")}</span>
            </span>
          </a>
          <div className="hidden items-center gap-1 text-sm lg:flex">
            <NavLink href="#map" active={activeSection === "map"}>{t("navMap")}</NavLink>
            <NavLink href="#distributions" active={activeSection === "distributions"}>{t("navDists")}</NavLink>
            <NavLink href="#playground" active={activeSection === "playground"}>{t("navPlayground")}</NavLink>
            <NavLink href="#tools" active={activeSection === "tools"}>{t("navTools")}</NavLink>
            <NavLink href="#relationships" active={activeSection === "relationships"}>{t("navRelationships")}</NavLink>
            <NavLink href="#comparison" active={activeSection === "comparison"}>{t("comparison")}</NavLink>
            <NavLink href="#education" active={activeSection === "education"}>{t("navEducation")}</NavLink>
            <NavLink href="#chat" active={activeSection === "chat"}>{t("navChat")}</NavLink>
            <NavLink href="#feedback" active={activeSection === "feedback"}>{t("navFeedback")}</NavLink>
          </div>
          <ControlBar />
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section id="top" className="relative overflow-hidden border-b border-border bg-atlas-fade">
        <div className="absolute inset-0 bg-atlas-grid opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t("badge")}
            </span>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              {t("heroTitle1")}
              <span className="block bg-gradient-to-l from-amber-600 via-rose-500 to-emerald-600 bg-clip-text text-transparent">
                {locale === "fa" ? "و روابط میان آن‌ها" : "and their relationships"}
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("heroDesc")}
            </p>
            <div className="mt-6 max-w-md">
              <SearchBox />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile value={distributions.length} label={t("statDistributions")} accent="var(--accent-emerald)" />
              <StatTile value={nDiscrete} label={t("statDiscrete")} accent="var(--accent-teal)" />
              <StatTile value={nContinuous} label={t("statContinuous")} accent="var(--accent-amber)" />
              <StatTile value={relationships.length} label={t("statRelationships")} accent="var(--accent-rose)" />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#map" className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90">
                {t("viewMap")}
              </a>
              <a href="#distributions" className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                {t("browseDists")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-4">
        {/* ===== Relationship map ===== */}
        <Section id="map" eyebrow={t("mapEyebrow")} title={t("mapTitle")} desc={t("mapDesc")}>
          <RelationshipMap />
        </Section>

        {/* ===== Distributions ===== */}
        <Section id="distributions" eyebrow={t("distsEyebrow")} title={`${distributions.length} ${t("statDistributions")}`} desc={t("distsDesc")}>
          <div className="mb-6 flex flex-wrap gap-2">
            <CatChip active={cat === "all"} onClick={() => setCat("all")} label={`${t("filterAll")} (${distributions.length})`} />
            <CatChip active={cat === "discrete"} onClick={() => setCat("discrete")} label={`${t("discrete")} (${nDiscrete})`} />
            <CatChip active={cat === "continuous"} onClick={() => setCat("continuous")} label={`${t("continuous")} (${nContinuous})`} />
            <CatChip active={cat === "favorites"} onClick={() => setCat("favorites")} label={`★ ${t("favorites")} (${fav.ids.length})`} />
          </div>
          {visibleDists.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              {t("noFavorites")}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleDists.map((d) => (
                <DistributionCard key={d.id} d={d} />
              ))}
            </div>
          )}
        </Section>

        {/* ===== Playground ===== */}
        <Section id="playground" eyebrow={t("playgroundEyebrow")} title={t("playgroundTitle")} desc={t("playgroundDesc")}>
          <DistributionPlayground />
          <h3 className="mt-8 mb-3 text-xl font-bold">{t("cltTitle")}</h3>
          <p className="mb-4 text-sm text-muted-foreground">{t("cltDesc")}</p>
          <CLTPlayground />
        </Section>

        {/* ===== Tools ===== */}
        <Section id="tools" eyebrow={t("toolsEyebrow")} title={t("toolsTitle")} desc={t("toolsDesc")}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-lg font-bold">{t("calcTitle")}</h3>
              <ProbabilityCalculator />
            </div>
            <div>
              <h3 className="mb-3 text-lg font-bold">{t("sampleTitle")}</h3>
              <SampleGenerator />
            </div>
            <div className="lg:col-span-2">
              <h3 className="mb-3 text-lg font-bold">{t("fitterTitle")}</h3>
              <DistributionFitter />
            </div>
          </div>
        </Section>

        {/* ===== Relationships ===== */}
        <Section id="relationships" eyebrow={t("relsEyebrow")} title={`${relationships.length} ${t("statRelationships")}`} desc={t("relsDesc")}>
          <div className="mb-6">
            <RelationshipFilter types={types} active={relType} onChange={setRelType} />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleRels.map((r) => (
              <RelationshipCard key={r.id} r={r} />
            ))}
          </div>
        </Section>

        {/* ===== Comparison (interactive) ===== */}
        <Section id="comparison" eyebrow={t("comparison")} title={t("comparison")} desc={t("comparisonDesc")}>
          <ComparisonSelector />
        </Section>

        {/* ===== Education ===== */}
        <Section id="education" eyebrow={t("eduEyebrow")} title={t("eduTitle")} desc={t("eduDesc")}>
          <div className="space-y-12">
            <Subsection title={t("foundations")}>
              <Foundations />
            </Subsection>
            <Subsection title={t("inequalities")}>
              <Inequalities />
            </Subsection>
            <Subsection title={t("inference")}>
              <Inference />
            </Subsection>
            <Subsection title={t("conjugate")}>
              <ConjugatePriors />
            </Subsection>
            <Subsection title={t("stochastic")}>
              <StochasticProcesses />
            </Subsection>
            <Subsection title={t("glossary")}>
              <Glossary />
            </Subsection>
            <Subsection title={t("quiz")}>
              <Quiz />
            </Subsection>
          </div>
        </Section>

        {/* ===== Chatbot ===== */}
        <Section id="chat" eyebrow={t("navChat")} title={t("chatTitle")} desc={t("chatDesc")}>
          <Chatbot />
        </Section>

        {/* ===== Feedback ===== */}
        <Section id="feedback" eyebrow={t("feedbackEyebrow")} title={t("feedbackTitle")} desc={t("feedbackDesc")}>
          <Feedback />
        </Section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="mt-auto border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm font-bold">{t("brand")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {pick({ fa: "مرجع بصری و تحلیلی توزیع‌های احتمالی و روابط میان آن‌ها.", en: "A visual and analytical reference of probability distributions and their relationships." })}
          </p>
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">{t("footerNote")}</p>
          <p className="mt-2 text-[11px] text-muted-foreground">{t("printHint")}</p>
        </div>
      </footer>
    </div>
  );
}

/* ---------- building blocks ---------- */

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <a
      href={href}
      className={cn(
        "rounded-md px-3 py-1.5 transition-colors",
        active
          ? "bg-muted font-semibold text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </a>
  );
}

function StatTile({ value, label, accent }: { value: number; label: string; accent: string }) {
  const { locale } = useI18n();
  return (
    <div className="rounded-xl border border-border bg-card/70 p-3 backdrop-blur" style={{ borderColor: `color-mix(in oklch, ${accent} 30%, var(--border))` }}>
      <div className="text-2xl font-black" style={{ color: accent }}>
        {value.toLocaleString(locale === "fa" ? "fa-IR" : "en-US")}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Section({ id, eyebrow, title, desc, children }: { id: string; eyebrow: string; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 py-12 sm:py-16">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {desc ? <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{desc}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Subsection({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-xl font-bold">{title}</h3>
      {desc ? <p className="mb-4 text-sm text-muted-foreground">{desc}</p> : <div className="mb-4" />}
      {children}
    </div>
  );
}

function CatChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active ? "border-foreground bg-foreground text-background" : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}
