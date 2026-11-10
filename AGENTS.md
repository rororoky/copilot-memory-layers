# Agent guide

This file is the repo-level guide for AI coding agents working on **copilot-memory-layers**.
Read it before making structural changes.

## Project in one paragraph

A static, source-backed educational site about GitHub Copilot memory layers. Astro generates the
site, TypeScript is strict, and the runtime has no third-party dependencies. Every factual claim is
tied to an entry in `src/data/sources.ts`.

## Read first

1. `.github/copilot-instructions.md` — non-negotiables and commands.
2. `.github/instructions/mdx.instructions.md` — chapter authoring rules.
3. `.github/instructions/widgets.instructions.md` — interactive widget rules.
4. `docs/upgrade-plan.md` — migration record and architecture decisions. The migration is complete;
   the document is historical context, not an active phase list.

## Commands

```bash
npm run dev         # Astro dev server
npm run build       # static build to dist/
npm run preview     # serve dist/
npm run check       # astro check (Astro + TypeScript)
npm run check:links # verify internal links and anchors in dist/
npm run verify      # check + build + link check
```

Node 22.23.4 is required (see `.nvmrc`).

## Architecture

- Astro is the production site generator. It emits real static HTML to `dist/`; there is no client
  router.
- `src/content/chapters/<slug>/index.mdx` is the source of truth for chapter content.
- `src/content.config.ts` validates frontmatter with Zod.
- `src/lib/chapters.ts` loads, sorts, and validates collection entries.
- `src/data/` holds chapter types/navigation constants, sources, site metadata, and landing copy.
- `src/layouts/` holds `BaseLayout` (metadata, canonical, OG, JSON-LD, chrome) and `ChapterLayout`
  (page head, TOC, bibliography, pager).
- `src/components/chrome/` holds the build-time navigation and footer components.
- `src/components/content/` holds shared prose and metadata components.
- `src/components/widgets/WidgetSection.astro` mounts the existing vanilla widgets.
- `src/widgets/` holds the four `mountX(root)` diagrams.
- `src/scripts/chrome.ts` initialises theme, mobile navigation, active TOC links, and reveals.
- `src/lib/` holds chapter loading, DOM helpers, URL helpers, motion, TOC grouping, and the table
  rehype plugin.

## Authoring a chapter

Create `src/content/chapters/<slug>/index.mdx` with frontmatter:

- `title`, `nav`, `group`, `order`
- `blurb` (card copy), `description` (meta description), optional `lede` (visible intro)
- `tone` (`l0`–`l5`, `accent`, `violet`, `warn`)
- `sources` (every cited id)
- optional `draft`

The body starts with an `<h2>`; the layout renders the page header. Use `<Cite id="..."/>`,
`<Callout>`, `<Figure>`, and `<WidgetSection>` from `src/components/`. Plain Markdown tables are
auto-wrapped in `.table-wrap`.

Navigation, pager, TOC, landing card, and bibliography update automatically. Do not add a chapter to
a separate manifest.

## Guardrails

- **Content lives in MDX.** Do not reintroduce hand-written chapter HTML or a Vite MPA.
- **Never add a client-side router.** GitHub Pages must serve a real HTML file per route.
- **Never hard-code root-relative links.** Use `withBase()` so project pages work.
- **Runtime JavaScript stays limited** to `src/scripts/chrome.ts` and the existing widgets. Do not
  add React/Vue/Svelte or client-side data fetching.
- **Every factual claim needs a source.** The build should fail on an unknown citation id.
- **Keep metadata base-aware.** Canonical, OG, JSON-LD, robots, and sitemap all depend on `base`.
- **Preserve accessibility:** keyboard-operable widgets, live regions, skip link, focus styles, and
  `prefers-reduced-motion`.

## Verification

Before finishing a change:

```bash
npm run verify
BASE_PATH=/copilot-memory-layers npm run verify
```

Both runs must pass. The first checks a user/organisation site; the second checks a project site.

For interactive changes, also test in a browser:

- layer explorer: bands, selection, arrow-key navigation
- scope matrix: scenario switching
- lifecycle player: step controls and reduced-motion play
- context flow: source toggles and eviction status
- theme toggle
- landing page: 10 chapter cards, 4 facts, 3 sections
- desktop and mobile widths

## When in doubt

Prefer static HTML, build-time data, and the smallest change that keeps the production artifact
working. Record durable architecture decisions in `docs/upgrade-plan.md`.
