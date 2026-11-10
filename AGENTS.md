# Agent guide

This file is the repo-level guide for AI coding agents working on **copilot-memory-layers**.
Read it before making structural changes.

## Project in one paragraph

A static, source-backed educational site about GitHub Copilot memory layers. It is built with
Vite and strict TypeScript, ships no runtime dependencies, and makes no network requests after
load. Every factual claim is tied to an entry in `src/content/sources.ts`.

## Read first

1. `.github/copilot-instructions.md` — current non-negotiables and commands.
2. `.github/instructions/docs.instructions.md` — rules for chapter HTML (current architecture).
3. `.github/instructions/widgets.instructions.md` — rules for interactive widgets.
4. **`docs/upgrade-plan.md` — the Astro migration plan. Status: Phase 2 complete; Phase 3+ not started.**

## Upgrade plan (durable context)

The canonical plan is [`docs/upgrade-plan.md`](./docs/upgrade-plan.md). It is a repository-scoped
decision record. Do not create a parallel plan; update that document instead.

**Status:** Phase 2 complete (build-time chrome and data layer), Phase 3+ not started.
**Decision owner:** tommy.
**Created:** 2026-11-10; updated 2026-11-10.

### Recommendation

Adopt **Astro + MDX content collections**, keeping the existing vanilla TypeScript widgets as
islands. Astro uses Vite, so the current CSS, design tokens, and `mountX(root)` widgets can be
reused.

### Key design decisions

- Move chapter content from root folders into `src/content/chapters/<slug>/index.mdx`.
- Move routes into `src/pages/`: `index.astro`, `[...slug].astro`, and `404.astro`.
- Generate sidebar, top nav, pager, landing cards, chapter counts, TOC, and bibliographies from
  one content collection. No manual chapter registry.
- Put shared chrome in `src/layouts/` and `src/components/chrome/`.
- Put reusable prose primitives in `src/components/content/`: `Cite`, `SourceList`, `Callout`,
  `Badge`, `Figure`, `TableWrap`.
- Wrap each widget in `src/components/widgets/` and load its script only on pages that use it.
- Keep every public URL unchanged: `/concepts/`, `/layers/`, etc.
- Keep GitHub Pages static hosting: real `index.html` per route, no client-side router.
- Use base-aware links (`withBase()`) so the site works at both `/` and `/<repo>/`.
- Preserve zero JS on prose-only pages.

### Current vs. proposed authoring

**Current:** adding a chapter touches seven places — the page folder, `src/content/nav.ts`,
`vite.config.ts`, the landing page, the hero count, `README.md`, and the source registry.

**Proposed:** add one `src/content/chapters/<slug>/index.mdx` file with frontmatter. Navigation,
pager, landing card, counts, TOC, and bibliography update automatically. Add a source entry only
if the chapter introduces a new official source.

### Migration phases

| Phase | Work | Status |
| --- | --- | --- |
| 0 | Baseline screenshots, link audit, branch | Not started |
| 1 | Scaffold Astro, configure `base`/`site`/404, deploy a smoke build | **Complete** (2026-11-10) |
| 2 | Build layouts, chrome components, chapter data, URL helper | **Complete** (2026-11-10) |
| 3 | Convert chapters to MDX, one at a time | Not started |
| 4 | Wrap the four widgets; verify keyboard/reduced-motion behavior | Not started |
| 5 | Generate landing cards; add sitemap, canonical, OG, JSON-LD, optional Pagefind | Not started |
| 6 | Delete legacy HTML/chrome, update docs and CI | Not started |

Update the status column and the canonical plan when a phase is completed.

### Phase 1 notes (implemented)

- Astro **7.4.8**, `@astrojs/mdx` **8.1.3**, `@astrojs/sitemap` **3.7.4**,
  `@astrojs/check` **0.9.12**, Vite **8.3.6**.
- Node **22.23.4** is required and pinned in `.nvmrc`; `package.json` declares the same engine.
- Astro writes to `dist-astro/`, not `dist/`. The legacy Vite site still owns `dist/` and
  production deployment.
- Smoke routes: `src/pages/index.astro` and `src/pages/404.astro`.
- Shared scaffold layout: `src/layouts/BaseLayout.astro`.
- Base-aware URL helper: `src/lib/url.ts` (`withBase()`).
- `scripts/check-links.mjs` accepts an output directory:
  `node scripts/check-links.mjs dist-astro`.
- The deploy workflow runs `npm run verify:astro`, uploads an `astro-smoke` artifact, then builds
  and deploys the legacy `dist/` output unchanged.
- `.github/workflows/astro-smoke.yml` runs `verify:astro` on pull requests for both
  `BASE_PATH=/` and `BASE_PATH=/copilot-memory-layers`.
- Verified locally with both base paths; `astro check` reports 0 errors and the link checker
  passes both.

### Phase 2 notes (implemented)

- Framework-neutral data now lives in `src/data/`:
  - `chapters.ts` — chapter manifest, groups, top-nav subset, neighbors
  - `sources.ts` — citation registry and lookup helpers
  - `site.ts` — site metadata and verification date
- Legacy imports are preserved through thin adapters:
  - `src/content/nav.ts` re-exports the data and keeps `chapterHref()` / `homeHref()`
  - `src/content/sources.ts` re-exports the registry
  - `src/ui/anim.ts` re-exports `src/lib/motion.ts`
- Build-time chrome components live in `src/components/chrome/`:
  - `Topbar`, `Sidebar`, `Toc`, `Pager`, `Footer`, `ThemeToggle`
- Shared content components live in `src/components/content/`:
  - `PageHead`, `Cite`, `SourceList`, `Badge`, `Callout`, `Figure`, `TableWrap`
- Layouts:
  - `src/layouts/BaseLayout.astro` — head, theme boot, chrome, shell, client initialiser
  - `src/layouts/ChapterLayout.astro` — page head, slot, bibliography, pager
- Client behaviour lives in `src/scripts/chrome.ts`: theme toggle, mobile sidebar, active TOC
  link, and reveal animations. There is still no client-side router.
- `src/pages/[...slug].astro` renders temporary placeholder pages for all ten chapters so the
  sidebar, top nav, pager, TOC, citations, and link checker can be exercised before content
  migration. These placeholders are preview-only and must be replaced in Phase 3.
- `scripts/check-links.mjs` now validates same-page anchors as well as file targets. This catches
  broken TOC and citation links.
- The legacy Vite build still passes and still owns production deployment.
- Verified with `BASE_PATH=/` and `BASE_PATH=/copilot-memory-layers`: 12 Astro pages, 0 check
  errors, no broken links, and the legacy build/link check pass.

### Guardrails for agents

- **Phase 2 is complete; do not start Phase 3+ without explicit approval.** The current site
  must remain deployable.
- **Read `docs/upgrade-plan.md` before changing the information architecture.**
- **Do not replace the production build target** (`dist/`) until Phase 6. Astro currently builds
  to `dist-astro/` for verification only.
- **Do not treat `src/pages/[...slug].astro` placeholders as content.** They exist to exercise
  chrome and must be replaced by the content collection in Phase 3.
- **Do not implement a framework migration piecemeal** without following the phase plan; a
  half-migrated site is worse than the current one.
- **Keep content out of components.** Components render patterns; chapter prose lives in MDX.
- **Never add a client-side router.** GitHub Pages must serve a real HTML file per route.
- **Never hard-code root-relative links.** Use `withBase()` so project pages work.
- **Every factual claim still needs a source.** The build should fail on an unknown citation id.
- **Preserve accessibility:** keyboard-operable widgets, live regions, skip link, focus styles,
  and `prefers-reduced-motion`.

### Framework rule

The original “No framework” rule was updated in Phase 2. Astro is allowed **at build time only**:
it generates static HTML, the runtime remains dependency-free, and prose pages must ship no
JavaScript. Do not add React/Vue/Svelte or a client-side router.

Phases 1–2 are approved and the Astro chrome is in place, but the legacy site still owns the
production artifact. Until later phases are approved:

- Keep the legacy site and `dist/` deploy path working.
- Do not migrate chapter content yet; the placeholder routes are not the real pages.
- Do not change the GitHub Pages artifact from `dist` to `dist-astro`.
- Update `.github/instructions/docs.instructions.md` (and add MDX authoring rules) during the
  Phase 3 content migration.

## Current commands

```bash
npm run dev            # legacy Vite dev server
npm run build          # legacy: tsc --noEmit && vite build -> dist/
npm run preview        # serve legacy dist/
npm run check:links    # verify internal links in dist/
npm run typecheck      # tsc --noEmit

npm run dev:astro      # Astro dev server
npm run check:astro    # Astro diagnostics (requires Node 22.23.4+)
npm run build:astro    # Astro build -> dist-astro/
npm run preview:astro  # serve dist-astro/
npm run verify:astro   # check + build + link check
npm run check:links:astro
```

## Current structure

- `src/data/` — framework-neutral `chapters.ts`, `sources.ts`, and `site.ts`.
- `src/content/nav.ts`, `src/content/sources.ts` — legacy adapters over `src/data/`.
- `src/ui/chrome.ts` — legacy runtime chrome.
- `src/ui/anim.ts` — legacy adapter over `src/lib/motion.ts`.
- `src/widgets/` — four `mountX(root)` diagrams.
- `src/styles/` — tokens, base layout, widget styles.
- `<chapter>/index.html` — one directory per chapter (legacy architecture).
- `astro.config.mjs` — Astro config; outputs to `dist-astro/`.
- `src/pages/` — Astro routes: `index`, `404`, and temporary `[...slug]` placeholders.
- `src/layouts/` — `BaseLayout` and `ChapterLayout`.
- `src/components/chrome/` — build-time navigation and footer components.
- `src/components/content/` — `PageHead`, `Cite`, `SourceList`, `Badge`, `Callout`, `Figure`, `TableWrap`.
- `src/scripts/chrome.ts` — client initialiser for theme, mobile nav, TOC, and reveals.
- `src/lib/` — `url.ts`, `motion.ts`, and `toc.ts`.
- `scripts/check-links.mjs` — accepts an output directory and validates same-page anchors.
- `docs/upgrade-plan.md` — Astro migration design and progress.
- `AGENTS.md` — this guide.

## Target structure (after migration)

```text
src/
├── pages/                  # index, [...slug], 404
├── layouts/                # BaseLayout, ChapterLayout
├── components/
│   ├── chrome/             # Topbar, Sidebar, Toc, Pager, Footer
│   ├── content/            # Cite, SourceList, Callout, Badge, Figure
│   └── widgets/            # one wrapper per widget
├── content/chapters/       # <slug>/index.mdx
├── data/                   # site, sources, chapters
├── lib/                    # url, seo helpers
├── widgets/                # existing vanilla TS
└── styles/                 # existing CSS
```

## When in doubt

Prefer the smaller change that keeps the current site deployable. Ask before changing the
architecture. Record durable decisions in `docs/upgrade-plan.md`, not in chat.
