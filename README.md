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

### Astro migration scaffold (Phase 1)

The Astro scaffold builds alongside the legacy Vite site. It writes to `dist-astro/`; the
production build still writes to `dist/`, so the live site is unchanged until the migration
reaches cutover.

```bash
npm run dev:astro      # Astro dev server
npm run check:astro    # Astro + TypeScript diagnostics (Node 22.23.4+)
npm run build:astro    # static build to dist-astro/
npm run preview:astro  # serve dist-astro/
npm run verify:astro   # check + build + internal link check
npm run check:links:astro
```

The full design and phase plan live in [`docs/upgrade-plan.md`](./docs/upgrade-plan.md).

## Deploy to GitHub Pages

1. Push the repository to GitHub with `main` as the default branch.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and deploys.

The build reads `BASE_PATH` from the Pages action so project sites work at `/<repo>/`. For a user or
organisation site the value resolves to `/`.

## Project layout

```
├── index.html                 landing page
├── <chapter>/index.html       one directory per chapter, clean URLs
├── 404.html
├── astro.config.mjs           Astro scaffold (Phase 1, builds to dist-astro/)
├── src/
│   ├── content/nav.ts         single source of truth for the IA
│   ├── content/sources.ts     the citation registry
│   ├── ui/chrome.ts           header, sidebar, TOC, pager, citations
│   ├── ui/anim.ts             reveal + reduced-motion helpers
│   ├── widgets/               the four interactive diagrams
│   ├── styles/                tokens, base layout, widget styles
│   ├── pages/                 Astro smoke pages (index, 404)
│   ├── layouts/               Astro BaseLayout
│   └── lib/url.ts             base-aware URL helper
├── docs/upgrade-plan.md       migration design, progress, and status
├── AGENTS.md                  repo-level guide for AI agents
└── .github/                   deploy workflow + real instruction files
```

The `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md` files in this
repository are real, working examples of the instruction layer described in chapter 07.

## Accuracy policy

- Sources are read directly from `code.visualstudio.com/docs` and `docs.github.com`.
- Each entry in `src/content/sources.ts` records a verification date.
- Anything Experimental or in Preview is marked as such.
- Unpublished internals — retrieval scoring, vote thresholds — are described only in the terms the
  documentation uses, and listed as a known limit on the sources page.

If a statement here contradicts the official documentation, the documentation wins. Please open an
issue with the page, the sentence, and the date you checked.

## License

MIT — see [LICENSE](./LICENSE).
