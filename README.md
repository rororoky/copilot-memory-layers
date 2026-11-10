# GitHub Copilot Memory Layers

An interactive, source-backed guide to how GitHub Copilot remembers things — and how that memory is
scoped, retrieved, validated, and retired.

**Live site:** `https://<your-username>.github.io/copilot-memory-layers/`

> This is an independent educational resource. It is not affiliated with or endorsed by GitHub or
> Microsoft. Product behaviour changes; every claim links to the official documentation it came from.

## Why this exists

“Copilot remembered that” can mean at least six different things. Model weights, conversation state,
session scratch notes, repository knowledge, personal preferences, and reviewed instruction files all
behave differently — different owners, different lifetimes, different audiences. Most confusion about
agent memory comes from treating them as one thing.

This repo separates them, cites the documentation for each claim, and makes the mechanics something
you can poke at rather than read about.

## What is inside

Ten chapters across eleven static pages:

| Chapter | Topic |
| --- | --- |
| 01 | Memory, context, and instructions — the three mechanisms behind one word |
| 02 | The six layers — interactive explorer |
| 03 | Local memory scopes — scope survival matrix |
| 04 | Cloud Copilot Memory — repository facts vs user preferences |
| 05 | Memory lifecycle — step-through player |
| 06 | Context assembly — toggle sources and watch the window fill |
| 07 | The instruction layer — instructions, prompts, skills, agents, hooks |
| 08 | Choosing the right layer — decision tables |
| 09 | Safety, trust, and retention |
| 10 | Sources and method |

Four hand-built interactive diagrams, no chart libraries:

- **Layer explorer** — six bands with lifetime, scope, visibility, and how each reaches the model.
- **Scope matrix** — five situations × three scopes × three storage layers.
- **Lifecycle player** — play, step, or scrub through capture → store → recall → validate → vote → expire.
- **Context flow** — toggle instruction, skill, and memory sources; watch the window fill and evict.

Everything is drawn with SVG, CSS transitions, and `IntersectionObserver`. There are no runtime
dependencies, no analytics, and no network requests once the page has loaded.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + static build to dist/
npm run preview    # serve the built site
npm run check:links
```

Node 22.23.4 is required (see `.nvmrc`; Astro 7 requires this minimum).

### Astro migration scaffold (Phases 3–4)

The Astro site builds alongside the legacy Vite site. It writes to `dist-astro/`; the production
build still writes to `dist/`, so the live site is unchanged until the migration reaches cutover.

All ten chapters now live in `src/content/chapters/<slug>/index.mdx`. Frontmatter drives the
navigation, pager, TOC, meta description, and bibliography. The four interactive diagrams mount
from the existing vanilla TypeScript widgets through `WidgetSection`.

```bash
npm run dev:astro      # Astro dev server
npm run check:astro    # Astro + TypeScript diagnostics (Node 22.23.4+)
npm run build:astro    # static build to dist-astro/
npm run preview:astro  # serve dist-astro/
npm run verify:astro   # check + build + internal link check
npm run check:links:astro
```

The full design and phase plan live in [`docs/upgrade-plan.md`](./docs/upgrade-plan.md).

### Add or edit a chapter

Create `src/content/chapters/<slug>/index.mdx` with frontmatter:

```yaml
---
title: The six layers
nav: The six layers
group: Foundations
order: 2
blurb: Short card description.
description: Meta description for search and social previews.
lede: Visible page introduction.
tone: l1
sources:
  - vscode-memory
  - gh-copilot-memory
---
```

Write the body as Markdown/MDX. Use `<Cite id="..."/>` for citations, `<Callout>`,
`<Figure>`, and `<WidgetSection>` for shared patterns. Navigation, pager, TOC, and the source
list update automatically. Until Phase 6, also keep `src/data/chapters.ts` in sync because the
build asserts that the legacy manifest matches the collection.

## Deploy to GitHub Pages

1. Push the repository to GitHub with `main` as the default branch.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and deploys.

The build reads `BASE_PATH` from the Pages action so project sites work at `/<repo>/`. For a user or
organisation site the value resolves to `/`.

## Project layout

```
├── index.html                 legacy landing page
├── <chapter>/index.html       legacy chapter pages (frozen until cutover)
├── 404.html
├── astro.config.mjs           Astro config (builds to dist-astro/)
├── src/
│   ├── content.config.ts      chapter collection schema
│   ├── content/chapters/      ten MDX chapters
│   ├── data/                  chapters, sources, and site metadata
│   ├── content/nav.ts         legacy adapter over src/data
│   ├── content/sources.ts     legacy adapter over src/data
│   ├── components/chrome/     build-time Topbar, Sidebar, Toc, Pager, Footer
│   ├── components/content/    PageHead, Cite, SourceList, Badge, Callout, Figure
│   ├── components/widgets/    WidgetSection mounts the existing diagrams
│   ├── layouts/               BaseLayout and ChapterLayout
│   ├── pages/                 index, 404, and collection-driven chapter routes
│   ├── scripts/chrome.ts      theme, mobile nav, TOC, and reveal behaviour
│   ├── ui/chrome.ts           legacy runtime chrome
│   ├── ui/anim.ts             legacy adapter over src/lib/motion
│   ├── widgets/               the four interactive diagrams
│   ├── styles/                tokens, base layout, widget styles
│   └── lib/                   chapters, url, motion, TOC, and rehype helpers
├── docs/upgrade-plan.md       migration design, progress, and status
├── AGENTS.md                  repo-level guide for AI agents
└── .github/                   deploy workflow + real instruction files
```

The `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md` files in this
repository are real, working examples of the instruction layer described in chapter 07.

## Accuracy policy

- Sources are read directly from `code.visualstudio.com/docs` and `docs.github.com`.
- Each entry in `src/data/sources.ts` records a verification date.
- Anything Experimental or in Preview is marked as such.
- Unpublished internals — retrieval scoring, vote thresholds — are described only in the terms the
  documentation uses, and listed as a known limit on the sources page.

If a statement here contradicts the official documentation, the documentation wins. Please open an
issue with the page, the sentence, and the date you checked.

## License

MIT — see [LICENSE](./LICENSE).
