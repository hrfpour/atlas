# اطلس توزیع‌های آماری — Probability Atlas

A bilingual (Persian/English) reference of probability distributions and their relationships, with interactive playground, computational tools, AI assistant, and educational content.

## Development

```bash
bun install
bun run dev      # http://localhost:3000
bun run lint
```

## Deploy to GitHub Pages (static, free)

GitHub Pages serves only static files — no server runs. This project is set up
for static export. Here's the full step-by-step:

### 1. Create a GitHub repository

Create a new repository, e.g. `atlas` (so the site will be at
`https://hrfpour.github.io/atlas/`). If you name it
`<username>.github.io`, the site will be at `https://<username>.github.io/`.

### 2. Push the code

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/hrfpour/atlas.git
git push -u origin main
```

> If you don't want to commit the local SQLite database, add `db/` and
> `*.db` to `.gitignore` first (the database is only used for server-side
> feedback storage, which GitHub Pages doesn't use).

### 3. Enable GitHub Pages

In your repository:
- **Settings → Pages → Build and deployment → Source = "GitHub Actions"**

This tells GitHub to use the workflow file at `.github/workflows/deploy.yml`
to build and deploy the site.

### 4. Push to trigger the build

Every push to `main` (or a manual trigger of the workflow) will:
1. Install dependencies with `bun install`.
2. Remove the server-only API routes (they can't run on a static host).
3. Build a static export (`output: "export"`) into `out/`.
4. Auto-detect `basePath` from the repo name so assets load at
   `https://<owner>.github.io/<repo>/`.
5. Deploy the `out/` folder to GitHub Pages.

### 5. Visit your site

After the workflow finishes (1–3 minutes), your site is live at:
```
https://hrfpour.github.io/atlas/
```
(replace `atlas` with your repo name, or use the root domain if your repo is
`hrfpour.github.io`).

## What works on GitHub Pages (static)

- ✅ All 44 distribution cards (with advanced fields, code snippets, favorites, TTS)
- ✅ The relationship map (44 nodes, clickable, scroll-spy)
- ✅ Interactive playground (parameter sliders, live PDF/PMF charts)
- ✅ Central Limit Theorem playground
- ✅ Probability calculator, sample generator, distribution fitter
- ✅ Interactive comparison (select distributions to compare)
- ✅ All educational sections (foundations, inequalities, inference, conjugate priors, stochastic processes, glossary, quiz)
- ✅ Search, theme toggle (dark/light), language toggle (FA/EN), font-size control, favorites
- ✅ **Feedback form** — uses FormSubmit to email `hrfpour@gmail.com` directly (no server needed). The first submission triggers a one-time confirmation email from FormSubmit — click the link to activate.

## What does NOT work on GitHub Pages (no server)

- ❌ The AI chatbot (`/api/chat`) — shows a clear message directing users to the feedback section instead.
- ❌ The server-side feedback API (`/api/feedback`) — replaced by FormSubmit (works on static).

## Deploy with a real server (VPS / Vercel / Netlify Functions)

If you want the AI chatbot and GitHub-Issue feedback to work, deploy where a
Node.js server runs:

1. Restore the API routes: copy `api-src/` back to `src/app/api/`.
2. Set `output: "standalone"` in `next.config.ts` (the default when `STATIC_EXPORT`
   is not set).
3. Set environment variables:
   - `GITHUB_TOKEN` — a fine-grained PAT with "Issues: Write" on your repo.
   - `GITHUB_REPO_OWNER` — e.g. `hrfpour`
   - `GITHUB_REPO_NAME` — e.g. `atlas`
4. Build and run:
   ```bash
   bun run build
   bun run start
   ```

For Vercel/Netlify, connect your GitHub repo and they'll detect Next.js
automatically. Set the env vars in their dashboard.

## FormSubmit (feedback on static hosts)

The feedback form posts to `https://formsubmit.co/ajax/hrfpour@gmail.com`.
- **First submission:** FormSubmit sends a confirmation email to
  `hrfpour@gmail.com`. Click the link to activate.
- **After activation:** every form submission arrives as an email to
  `hrfpour@gmail.com` with the message, type, email, and locale.
- To change the email, edit `FORMSUBMIT_ENDPOINT` in
  `src/components/feedback.tsx`.

## Tech stack

- Next.js 16 (App Router, static export)
- TypeScript, Tailwind CSS 4, shadcn/ui
- KaTeX (math), Recharts (charts), Zustand (state), Prisma + SQLite (server only)
- z-ai-web-dev-sdk (server-side LLM for the chatbot)
