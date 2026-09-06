# Worklog — Atlas of Statistical Distributions (v2 expansion)

This file records work from all agents on the bilingual/dark/interactive expansion.

---
Task ID: 3c
Agent: general-purpose
Task: Build AI chatbot API route + UI

Work Log:
- Read worklog.md, src/data/distributions.ts (27 distributions), src/data/relationships.ts (38 relationships), src/lib/i18n.ts, src/lib/dictionary.ts, and src/components/distribution-card.tsx to understand conventions (rounded-2xl cards, atlas-scroll, accent-color inline styles with color-mix, $...$-delimited inline math, `#dist-<id>` card anchors).
- Invoked the LLM skill (Skill(command="LLM")) and read skills/LLM/SKILL.md and skills/LLM/scripts/chat.ts. Key takeaways: z-ai-web-dev-sdk MUST be used server-side only; the system prompt is supplied as the first message with role "assistant"; call `ZAI.create()` then `zai.chat.completions.create({ messages, stream: false, thinking: { type: "disabled" } })`; read `completion.choices[0].message.content`.
- Added two new translation keys (chatWelcome, chatError) to BOTH the fa and en blocks of src/lib/dictionary.ts. The existing chat keys (chatTitle, chatDesc, chatPlaceholder, chatSend, chatThinking) were already present.
- Created src/app/api/chat/route.ts — a Next.js App Router Route Handler with `runtime = "nodejs"` and `dynamic = "force-dynamic"`. POST handler validates `{ messages, locale }`, builds a locale-aware system prompt that embeds the full distribution list (id | EN name | FA name | category) and the full relationship list (from -> to | type | formula), prepends it as an assistant-role message, calls ZAI.create() + chat.completions.create(), and returns `{ reply }`. Returns 400 for bad input, 502 for empty model output, 500 on exception. Also exposes a GET that documents the endpoint shape.
- Created src/components/chatbot.tsx ("use client") — exports <Chatbot />. Uses useT, useDir, useI18n from @/lib/i18n and useToast from @/hooks/use-toast. Renders a violet-accented Card-like panel (rounded-2xl, border-border, color-mix accent strip + header) with: a scrollable message list (max-h-96 overflow-y-auto atlas-scroll), distinguishable user (bg-foreground) and assistant (bordered muted) bubbles, an animated "thinking" bubble with three bouncing dots, and an Input + icon Button input row. Posts to the relative path `/api/chat` with `{ locale, messages }`. Maintains local message state with a stable welcome bubble (re-translated on locale toggle if the user hasn't started chatting). Auto-scrolls to the bottom on every new message via a `bottomRef.scrollIntoView`. On error: shows a destructive toast AND appends an inline error bubble. Enter sends (Shift+Enter allows newline — though Input is single-line so this is just defensive).
- Implemented a small rich-text renderer inside chatbot.tsx: paragraphs split on newlines; each paragraph is split on `$...$` so math segments go to the existing <Math> component (KaTeX, inline, LTR); text segments are passed through a TextWithLinks component that turns any known distribution id (matched with a lookbehind/lookahead-bounded regex sorted longest-first) into a violet dotted-underline <a href={`#dist-<id>`}> deep-link, so when the assistant mentions "binomial" or "chi-square" the user can click to jump to that card.
- Verified end-to-end against the running dev server (port 3000) WITHOUT modifying it: GET /api/chat returns metadata; POST /api/chat with an English prompt returned a concise grounded reply ("Use Poisson for counting rare events over a fixed interval..."); POST /api/chat with a Persian prompt returned a Persian reply with proper inline `$...$` LaTeX mentioning normal → chi-square; missing-messages and malformed-JSON bodies return 400 with a helpful error string. `bunx tsc --noEmit` shows zero errors in my new files (the only TS errors are pre-existing ones under examples/ and skills/, both of which are eslint-ignored).

Stage Summary:
- Files created:
  - src/app/api/chat/route.ts — POST endpoint, Node.js runtime, calls z-ai-web-dev-sdk server-side.
  - src/components/chatbot.tsx — "use client" panel with message list, thinking indicator, input box, toast + inline error handling, and id-linkified mixed LaTeX/text rendering.
- Files modified:
  - src/lib/dictionary.ts — added chatWelcome and chatError keys to both fa and en blocks.
- SDK invocation: `const zai = await ZAI.create(); const completion = await zai.chat.completions.create({ messages: [{role:"assistant", content: systemPrompt}, ...history], stream: false, thinking: { type: "disabled" } }); const reply = completion?.choices?.[0]?.message?.content?.trim();`. The SDK is imported only in the server route file; the client component never imports it.
- System prompt strategy: a single locale-aware string that (1) names the assistant "Ask the Atlas", (2) forces Persian-or-English output, (3) embeds the full id/name/category list of all 27 distributions and the full from→to/type/formula list of all 38 relationships so the model can ground its answers, and (4) gives 6 explicit rules — stay on-topic, 3-6 sentences, mention verbatim distribution ids (max 3 per answer) so the UI can deep-link, inline-only `$...$` LaTeX (no `$$` display blocks), no invented distributions/relationships, and plain-text output without code/quote wrapping. The conversation history (last 12 user/assistant turns) is appended after the system prompt before calling the model.
- UI deep-linking: the chatbot component post-processes assistant replies client-side to wrap any token equal to a known distribution id (e.g. `binomial`, `negative-binomial`, `chi-square`) in `<a href="#dist-<id>">`, matching the anchors emitted by DistributionCard, so users can click from the chat directly to the relevant card.

---
Task ID: 3b
Agent: general-purpose
Task: Create bilingual educational data files

Work Log:
- Read worklog.md, src/data/distributions.ts (27 distributions, ids confirmed) and src/data/relationships.ts (38 relationships, terminology and LaTeX style noted). Confirmed bilingual conventions: Persian natural text, KaTeX LaTeX with double-escaped backslashes (`\\frac`, `\\sum`, ...), inline math delimited by `$...$`, English-only inside `\text{...}` (no Persian in any math-mode macro).
- Created 9 self-contained TypeScript modules under src/data/. Each declares its own `export type Bi = { fa: string; en: string };` helper so the modules are independently importable.
- For every LaTeX cell/string, verified: backslashes are double-escaped for the TS source; no Persian characters appear inside `\text{}`, `\mathrm{}`, `\operatorname{}`, `\mathbb{}`, `\mathcal{}`, `\mathbf{}`, `\boldsymbol{}`, `\mathit{}`, or `\mathsf{}` (verified via ripgrep on the whole src/data directory — zero matches).
- For the decision tree, cross-checked every `dist:<id>` leaf against the actual distribution ids in distributions.ts: discrete-uniform, hypergeometric, multinomial, bernoulli, binomial, poisson, geometric, negative-binomial, beta, continuous-uniform, pareto, exponential, lognormal, weibull, gamma, normal, laplace, student-t, cauchy — all 19 are valid existing ids. Verified no dead ends: every option.next points to either a node id present in `nodes` or a `dist:<id>` key present in `results`.
- Spot-checked Persian for naturalness (e.g. "بی‌حافظگی", "توزیع چندجمله‌ای", "قضیه حد مرکزی") and removed three accidental mixed-script tokens that slipped in during drafting (a stray Chinese "完备" and "贝叶ز" and a Hungarian "gáz") before final write.
- Verified TypeScript compiles cleanly: `npx tsc --noEmit --skipLibCheck` shows zero errors in any of the 9 new files (pre-existing errors only under examples/ and skills/, both eslint-ignored and untouched).

Stage Summary:
- Files created (all under /home/z/my-project/src/data/):
  - glossary.ts — 30 GlossaryEntry items (random variable, PMF, PDF, CDF, quantile, expectation, variance, std dev, moment, MGF, characteristic function, skewness, kurtosis, entropy, independence, i.i.d., conjugate prior, likelihood, posterior, MLE, method of moments, CLT, LLN, support, hazard function, survival function, quantile function, covariance, correlation, Jensen).
  - conjugate-priors.ts — 10 ConjugatePrior entries (Bernoulli–Beta, Poisson–Gamma, Exponential–Gamma, Normal-known-var–Normal, Normal-unknown-var–Normal-Gamma, Multinomial–Dirichlet, Geometric–Beta, Negative-Binomial–Beta, Uniform–Pareto, Gamma-known-rate–Gamma), each with a LaTeX update rule.
  - foundations.ts — 10 FoundationTopic entries (random-variable, cdf, pdf-pmf, expectation, variance, moments, independence, covariance-correlation, conditional-probability, mgf).
  - inequalities.ts — 8 Inequality entries (Markov, Chebyshev, Jensen, Hölder, Cauchy–Schwarz, Minkowski, Chernoff, Hoeffding).
  - inference.ts — 6 InferenceMethod entries (MLE, method-of-moments, bayesian-estimation, confidence-interval, hypothesis-testing, bootstrap).
  - stochastic-processes.ts — 8 StochasticProcess entries (poisson-process, brownian-motion, markov-chain, martingale, gaussian-process, branching-process, renewal-process, random-walk).
  - decision-tree.ts — 12 question nodes + 19 result leaves, traversable from "start" with no dead ends; every leaf is `dist:<existing-id>`.
  - comparison-tables.ts — 3 ComparisonTable objects: count-dists (Binomial/Poisson/NegBin/Hypergeo, 5 rows), symmetric-dists (Normal/t/Cauchy/Logistic/Laplace, 5 rows), positive-dists (Exponential/Gamma/Weibull/Lognormal/Pareto, 4 rows).
  - quiz.ts — 12 QuizQuestion items (4 options each, mix of identification, relationships, moments, CLT/limits; easy → medium → harder).
- No other files touched. No tests written (per task rules).

---
Task ID: 3a
Agent: general-purpose
Task: Expand bilingual distribution data with advanced fields

Work Log:
- Read worklog.md and existing src/data/distributions.ts (27 distributions, old schema).
- Inventoried 27 existing ids to preserve verbatim and 17 new ids to add.
- Designed per-distribution math (CDF, MGF, charFn, skewness, excess kurtosis, mode, median, entropy, hazard where applicable) for all 44 distributions, citing standard references.
- Wrote bilingual Bi = { fa, en } for desc, notes, example, history, mistakes on every distribution; params[].desc also upgraded to Bi.
- Assigned tags (memoryless, heavy-tail, conjugate-prior, lifetime, sampling, limiting, stable, positive-support, multivariate, generating) per the rules in the brief.
- Assigned plotDomain hints per category (count/discrete -> [0,20]; positive continuous -> [0,5] or wider for heavy tails; real-line -> [-4,4]; beta/dirichlet -> [0,1]).
- Filled hazard field for the 10 lifetime distributions (exponential, gamma, weibull, lognormal, pareto, rayleigh, erlang, laplace, inverse-gaussian, levy); omitted for others.
- Verified: 44 entries (no duplicate ids), 44 plotDomain entries, 12 balanced cases environments, no Persian/Arabic characters inside \text{} blocks.
- TypeScript type-checks the file cleanly under `npx tsc --noEmit src/data/distributions.ts`.
- Did NOT modify any other file; existing distribution-card.tsx / mixed-text.tsx will need downstream updates to consume the new Bi schema (expected, outside this task's scope).

Stage Summary:
- Total distributions: 44 (27 upgraded + 17 added).
- New ids: folded-normal, half-normal, maxwell-boltzmann, inverse-gamma, inverse-gaussian, beta-prime, levy, gumbel, gev, frechet, zipf, benford, skellam, triangular, truncated-normal, skew-normal, rademacher.
- New schema fields added (all bilingual or LaTeX): cdf, mgf, charFn?, skewness, kurtosis, mode, median, entropy, hazard?, desc:Bi, notes:Bi, example:Bi, history:Bi, mistakes:Bi, sources[], tags[], plotDomain?. params[].desc upgraded from string to Bi. Helper type Bi = { fa, en } exported.
- File size: 2136 lines. Distribution ids stable (unchanged for the original 27).

---
Task ID: final
Agent: main
Task: Integrate architecture, build interactive tools, assemble page, verify

Work Log:
- Built i18n core (Zustand store + dictionary, useT/usePick/useDir/useI18n hooks) and LocaleController syncing <html lang/dir>.
- Added ThemeProvider (next-themes) + ThemeToggle, LangToggle, FontScaleController, ControlBar.
- Built stats.ts library: lgamma, erf, incompleteBeta, normInv, 20 DistSpecs (pdf/cdf/quantile/mean/variance/sample), sampleMoments, makeRng.
- Expanded relationships.ts to bilingual Bi + added ~17 new edges for new distributions + backlinks map.
- Built DistributionCard v2: advanced collapsible (CDF/MGF/skew/kurt/mode/median/entropy/hazard), Python+R code with copy, favorites (★), TTS read-aloud, backlinks, tags, sources.
- Built RelationshipMap v2: 44 nodes, click-to-scroll, keyboard Enter/Space, legend, larger viewBox.
- Built DistributionPlayground (recharts, multi-layer overlay, parameter sliders, live mean/variance).
- Built CLTPlayground (sample from 5 source dists, histogram vs overlay normal).
- Built tools: ProbabilityCalculator, SampleGenerator (CSV download), DistributionFitter (method-of-moments + KS).
- Built SearchBox (full-text over name/desc/notes/example/tags).
- Built education.tsx: DecisionTreeExplorer, ComparisonTables, Glossary, Foundations, Inequalities, Inference, StochasticProcesses, ConjugatePriors, Quiz — all bilingual.
- Integrated Chatbot (built by subagent 3c) + all sections into page.tsx.
- Fixed: set-state-in-effect lint, locale scoping, KaTeX overflow on mobile (CSS :has wrapper overflow), main min-w-0.

Stage Summary:
- 44 distributions, 55 relationships, 611 rendered formulas, 9 educational datasets, AI chatbot API working end-to-end (verified reply via curl + browser).
- Bilingual FA/EN with live lang/dir switching, dark mode, font-size control, favorites persisted to localStorage.
- Lint clean, no console errors/warnings, no mobile horizontal overflow (LTR+RTL), Agent Browser verified interactivity (playground sliders, CLT draw, map click-scroll, advanced card expand, chat send/reply, dark toggle, lang toggle).

---
Task ID: fixes-tts-arrow
Agent: main
Task: Fix TTS reading LaTeX + fix relationship arrow direction under EN locale

Work Log:
- TTS: changed speak() to read ONLY the distribution name ("توزیع پواسون." / "Poisson distribution.") with correct lang attribute (fa-IR / en-US). Removed desc+notes (which contained $...$ LaTeX) from the spoken text.
- Relationship arrow: made direction-aware. In FA (RTL) flex lays `from` on the right, so arrow "←" points to `to` on the left = correct. In EN (LTR) flex lays `from` on the left, so arrow must be "→" (previously hardcoded "←" which reversed the meaning). Now uses locale === "fa" ? "←" : "→".
- Also made flow-button arrows locale-aware: CLT "draw" button and quiz "nextQuestion" button use "←" in FA and "→" in EN.
- Backlinks indicator: replaced ambiguous "← incoming · → outgoing" with direction-independent ↙ (emerald, incoming) and ↗ (amber, outgoing) glyphs.
- Verified: bern-bin card shows "←" in FA and "→" in EN, both correctly pointing Bernoulli→Binomial. No console errors, no mobile overflow in either locale, lint clean, 614 formulas still render visually.

Stage Summary:
- TTS now reads only the distribution name (no LaTeX) — meaningful audio.
- Relationship arrows are now direction-correct in both FA (RTL) and EN (LTR).
- All flow buttons (draw, next) direction-aware.
- Full re-verification passed: lint clean, no console errors, mobile overflow=false both langs.

---
Task ID: fixes-round3
Agent: main
Task: Fix 14 UX/i18n issues from user feedback

Work Log:
- Scroll preservation: LocaleController now captures scrollX/scrollY before the dir flip and restores them via requestAnimationFrame after. Verified scrollY jump dropped from ~14000px to ~40px.
- GEV map node overflow: node width is now dynamic (150 default, +12 for >13 chars, +30 for >18 chars) and font-size scales 12→10.5→9.5 by name length. GEV (21 chars) now fits within viewBox.
- Scrollspy: added useScrollSpy hook observing section ids; NavLink now highlights the active section (bg-muted + font-semibold) as you scroll. Verified active link updates on scroll to relationships/chat.
- Chat clear history: added Eraser button in chatbot header with confirm dialog; resets messages to welcome only. Verified: 4 messages → 2 (welcome only) after clear.
- Footer alignment: "ساخته‌شده با Next.js" now wrapped with dir="ltr" so it right-aligns correctly in RTL.
- کنجوگ → مزدوج: replaced all 8 occurrences across distributions.ts, conjugate-priors.ts, foundations.ts, glossary.ts, decision-tree.ts.
- Conjugate priors table: headers now bilingual (درست‌نمایی/پیشین/پسین/قاعده‌ی به‌روزرسانی) and Update column header is dir="ltr" + text-start (left-aligned).
- Removed "کدام توزیع؟" decision tree from education section and its dictionary keys.
- Comparison: moved out of education into its own #comparison section; replaced static tables with interactive ComparisonSelector — user picks any distributions to compare side by side across 6 rows (support/mean/variance/skewness/type/when-to-use).
- Fitter Persian: replaced hardcoded English help text with fitterPasteHelp key; added fitterBestFit/fitterParams/fitterScore/fitterLowerBetter keys. Result card now fully Persian ("بهترین برازش", "پارامترها", "آماره‌ی KS ≈ ... (کمتر = بهتر)").
- CLT playground: localized "source distribution" → sourceDist, "seed" → seed, chart legend "empirical/Normal" → empirical/normalCurve keys, sample mean/sd/theoretical notes. Verified title "آزمایشگاه قضیه‌ی حد مرکزی".
- TTS: made robust — cancel ongoing speech, pick matching voice, onerror handler shows a toast with the distribution name if audio fails (sandbox has no voices), so the user at least sees the name. Verified toast "توزیع پواسون." appears.
- Search placeholder already translated (was a cached-state issue); confirmed "Search distribution, formula or term…" in EN.

Stage Summary:
- All 14 issues resolved + verified in browser (both FA and EN).
- Lint clean, no console errors, no mobile overflow.
- Scrollspy active highlighting works; scroll position preserved across language switch (~40px residual vs ~14000px before).

---
Task ID: fix-tts
Agent: main
Task: Fix TTS (read-aloud) — audio was not playing

Work Log:
- Diagnosed: speechSynthesis.speak() was returning error "not-allowed" because:
  1. The previous async speak() awaited before calling speak(), losing the user-gesture context that browsers require for TTS activation.
  2. Voices load asynchronously (getVoices() empty until voiceschanged fires), so the voice was undefined on first click.
  3. Chrome sometimes starts speechSynthesis paused.
- Created /src/lib/tts.ts helper:
  - Preloads voices on module load via voiceschanged listener + cachedVoices.
  - speak() is synchronous (called within the click handler, no await before it) to preserve user-gesture context.
  - Picks best matching voice by exact lang → language prefix → any voice (fallback).
  - Calls synth.resume() after speak() in case Chrome started paused.
  - Tracks onstart to detect genuine speech; safety timeout resolves ok=false on silent failure.
  - hasVoices() checks cached + live voices.
- Rewrote DistributionCard.speak():
  - If no voices at all installed → immediately show a toast with the name + guidance to install a TTS engine (no waiting for silent failure).
  - Else call speak() synchronously; on failure, try the English name with an English voice as fallback.
  - Final fallback: toast with the name.
- Verified in browser: FA toast "توزیع پواسون. روخوانی صوتی در این مرورگر فعال نیست..." and EN toast "Poisson distribution. Audio is unavailable in this browser..." both render correctly.
- On a real user device with TTS voices installed (most modern browsers), speak() will now actually play because: voices preload, the call is synchronous within the gesture, and resume() is called.

Stage Summary:
- TTS now: preloads voices, calls speak synchronously (preserves user gesture), resumes if paused, falls back to English name, and shows a clear toast with guidance if audio is genuinely unavailable.
- No console errors, no mobile overflow, lint clean.

---
Task ID: fixes-round4
Agent: main
Task: Fix 4 issues — TTS in FA, scroll preservation, footer alignment, add feedback section

Work Log:
- TTS in FA: changed speak() to ALWAYS use the English name + en-US voice (most browsers ship English TTS by default; Persian voices are rare). User confirmed English audio works, so the same voice now plays in both language modes. On no-voice environments, a toast shows the English name.
- Scroll preservation: rewrote LocaleController to (1) find the element nearest the viewport top before the dir flip, recording its absolute offset; (2) flip dir/lang; (3) double-rAF + setTimeout to restore that element to the same offset. Verified: scrollY at tools (FA) 10574 → after EN switch 11473 (diff 899, still in tools section) vs ~14000px jump before.
- Footer alignment: removed dir="ltr" from the "Built with" <p> so it follows the page direction naturally. FA: brand on right, "ساخته‌شده با..." on left (justify-between RTL). EN: brand on left, "Built with..." on right (justify-between LTR). Both now at their natural end.
- Feedback section: 
  - Added Feedback model to Prisma schema (id, type, message, email, locale, userAgent, createdAt) + pushed to DB.
  - Created /api/feedback POST route that validates and persists feedback to the database.
  - Built Feedback component: type selector (bug/suggestion/question/other), message textarea, optional email, send button with sending/sent/error states, plus direct contact links (email, GitHub issues, live chat).
  - Added feedback section to page.tsx after chatbot, added nav link "گزارش مشکل"/"Report issue", added to scrollspy.
  - Verified: submission works end-to-end (feedback saved to DB with type/message/locale/userAgent), success toast "گزارش شما ارسال شد", contact links render in both langs.

Stage Summary:
- All 4 issues resolved + verified.
- TTS now plays the same English audio in both language modes.
- Scroll preserved across language switch (anchor-based restoration, ~900px residual vs ~14000px jump).
- Footer "Built with" aligns naturally per direction.
- New feedback section with form + direct contact, persisted to DB, bilingual, in nav + scrollspy.
- Lint clean, no console errors, no mobile overflow (FA+EN).

---
Task ID: fixes-round5
Agent: main
Task: Remove footer "Built with" line entirely, set real contact info, improve feedback storage

Work Log:
- Footer: removed the flex two-column layout and the <p>{t("footerBuilt")}</p> line entirely. Footer is now a simple stack: brand name + description + footerNote + printHint. Verified no leftover empty space, no "ساخته‌شده"/"Built with" text in either language.
- Contact links: replaced placeholders with real user info — mailto:hrfpour@gmail.com, https://github.com/hrfpour, and #chat (live assistant).
- Feedback storage: 
  - /api/feedback POST now writes to BOTH the SQLite database (Feedback model) AND appends to feedback.json at the project root (GitHub-committable, survives serverless restarts).
  - If the DB is unavailable (e.g. serverless deploy without a real DB), it falls back to JSON-only with a generated id.
  - Added GET /api/feedback/list that merges DB + JSON, de-duplicates by id, returns newest first.
  - Verified: POST creates feedback.json with the record; GET /api/feedback/list returns merged records (DB + JSON).

Stage Summary:
- Footer cleaned (no "Built with" line, no empty space).
- Real contact info wired (hrfpour@gmail.com, github.com/hrfpour).
- Feedback now persisted to DB + feedback.json (committable to GitHub) + a list endpoint to read them.

---
Task ID: feedback-github-pages
Agent: main
Task: Make feedback work on static GitHub Pages + explain storage to user

Work Log:
- Diagnosed: GitHub Pages is static hosting — no server runs, so /api/feedback (and the SQLite DB / feedback.json) cannot work there. The previous setup only worked where a Next.js server runs.
- Rewrote /api/feedback POST to create a GitHub Issue (needs GITHUB_TOKEN + repo env vars). Works on any host WITH a running server (VPS/Vercel/Netlify Functions).
- Rewrote /api/feedback/list GET to read feedback-* labeled issues from GitHub.
- Built a hybrid fallback in the Feedback component:
  1. Try /api/feedback first (works on hosts with a server).
  2. If it fails (e.g. GitHub Pages static), fall back to FormSubmit (https://formsubmit.co/ajax/hrfpour@gmail.com) which emails the message directly to hrfpour@gmail.com — no server needed, no signup, free.

Stage Summary:
- On GitHub Pages: form → FormSubmit → your email inbox. First submission triggers a one-time confirmation email from FormSubmit.
- On a host with a server: form → GitHub Issue in your repo (you read & reply on GitHub).
- Both paths verified to dispatch correctly; lint clean.

---
Task ID: github-pages-deploy
Agent: main
Task: Configure project for static GitHub Pages deployment + write full guide

Work Log:
- Diagnosed: GitHub Pages is static-only. Next.js API routes (/api/chat, /api/feedback) require a server and won't work there. The app's client-side features (cards, map, playground, tools, education, feedback via FormSubmit) all work statically.
- next.config.ts: made output conditional — "standalone" for dev/server, "export" for static builds (when STATIC_EXPORT=1). Auto-detects basePath from GITHUB_REPOSITORY for project sites (https://<owner>.github.io/<repo>/).
- Moved server-only API routes to api-src/ as a backup reference (kept in repo, excluded from static builds).
- Chatbot: added graceful offline message pointing users to the feedback section when /api/chat is unavailable (static hosts).
- Feedback form: hybrid fallback already in place — tries /api/feedback first, then FormSubmit (emails hrfpour@gmail.com) which works on static hosts.
- Created .github/workflows/deploy.yml: GitHub Action that installs deps, removes api routes, builds static export with STATIC_EXPORT=1, adds .nojekyll, uploads artifact, deploys to Pages. Auto-triggers on push to main.
- Added public/.nojekyll to prevent Jekyll processing.
- Added build:static script to package.json.
- Wrote comprehensive README.md with full step-by-step deploy guide (create repo, push, enable Pages=GitHub Actions, visit site), what works/doesn't on static, how to re-enable server features on VPS/Vercel, FormSubmit setup notes.
- Verified: static export builds successfully with basePath /atlas applied; dev server still works normally (output: standalone).

Stage Summary:
- Project is now deployable to GitHub Pages with one push.
- All client-side features work statically; chatbot shows offline message; feedback goes to FormSubmit → email.
- Server-side features (chatbot AI, GitHub-Issue feedback) can be re-enabled by deploying to a host with a Node.js server (instructions in README).
