---
title: Astro upgrade plan for copilot-memory-layers
scope: repository
status: phase-5-complete
created: 2026-11-10
updated: 2026-11-11
owner: tommy
---

# Upgrade plan: content-driven Astro site

> **Memory metadata.** This is a repository-scoped decision record, not a session note.
> It should survive new chats, be readable by anyone with repository access, and be
> superseded (not silently edited) if the architecture changes.

## Progress log

### 2026-11-10 — Phase 1 complete

- Installed Astro 7.4.8, `@astrojs/mdx` 8.1.3, `@astrojs/sitemap` 3.7.4,
  `@astrojs/check` 0.9.12, and Vite 8.3.6.
- Pinned Node 22.23.4 in `.nvmrc` and `package.json` engines. Astro 7 requires it.
- Added `astro.config.mjs`; Astro builds to `dist-astro/` so the legacy Vite site remains the
  production artifact.
- Added `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `src/pages/404.astro`, and
  `src/lib/url.ts` (`withBase()`).
- Extended `scripts/check-links.mjs` to accept an output directory.
- Added `dev:astro`, `check:astro`, `build:astro`, `preview:astro`, `check:links:astro`, and
  `verify:astro` scripts.
- Updated `.github/workflows/deploy.yml` to verify the Astro scaffold and upload an
  `astro-smoke` artifact before building and deploying the legacy site.
- Added `.github/workflows/astro-smoke.yml` to verify both `BASE_PATH=/` and
  `BASE_PATH=/copilot-memory-layers` on pull requests.
- Verified locally with both base paths: `astro check` reports 0 errors, the Astro link check
  passes, and the legacy build/link check still pass.

**Not done yet:** content migration, widget wrappers, landing generation, and the production
deploy switch. Those remain Phase 3+.

### 2026-11-10 — Phase 2 complete

- Moved shared data to `src/data/`:
  `chapters.ts`, `sources.ts`, and `site.ts`. The legacy modules re-export this data so the
  Vite site and the Astro scaffold still read from one source.
- Moved motion helpers to `src/lib/motion.ts` and TOC grouping to `src/lib/toc.ts`.
- Added build-time chrome components:
  `Topbar`, `Sidebar`, `Toc`, `Pager`, `Footer`, and `ThemeToggle`.
- Added shared content components:
  `PageHead`, `Cite`, `SourceList`, `Badge`, and `Callout`.
- Added `BaseLayout` (head, theme boot, shell, chrome, client initialiser) and
  `ChapterLayout` (page head, slot, bibliography, pager).
- Added `src/scripts/chrome.ts` for theme toggling, mobile sidebar, active TOC links, and
  reveal animations. No client-side router was added.
- Added temporary `src/pages/[...slug].astro` placeholders for all ten chapters so navigation,
  pager, TOC, citations, and link checking can be exercised before content migration.
- Extended `scripts/check-links.mjs` to validate same-page anchors as well as file targets.
- Verified with `BASE_PATH=/` and `BASE_PATH=/copilot-memory-layers`: 12 Astro pages, 0 check
  errors, and no broken links. The legacy build and link check still pass.

**Not done yet:** generated landing cards, SEO additions, and the production deploy switch.
Those remain Phase 5+.

### 2026-11-10 — Phase 3 complete

- Added `src/content.config.ts` with a `chapters` collection. Each chapter lives at
  `src/content/chapters/<slug>/index.mdx`.
- Frontmatter is validated with Zod (`astro/zod`): title, nav, group, order, blurb, description,
  optional lede, tone, sources, and draft.
- Added `src/lib/chapters.ts` to load, sort, and validate collection entries. It checks unique
  orders, resolves every source id, and temporarily asserts parity with the legacy
  `src/data/chapters.ts` manifest.
- Replaced the placeholder `src/pages/[...slug].astro` with a real collection route that renders
  MDX through `ChapterLayout`, passes Astro headings to the TOC, and renders the bibliography
  from frontmatter `sources`.
- Migrated all ten chapters from HTML to MDX. Extracted text matches the legacy pages; the only
  addition is the build-time source-card list.
- Added `src/lib/rehype-wrap-tables.mjs` and the `@astrojs/markdown-remark` unified processor so
  plain Markdown tables get `.table-wrap`.
- Disabled syntax highlighting and Smartypants so code blocks and exact quotes keep the site's
  own styling and wording.
- Added `@astrojs/markdown-remark` 7.3.6 for the rehype-based table wrapper.
- Updated the home preview to read chapter links from the collection.

### 2026-11-10 — Phase 4 complete

- Added `src/components/widgets/WidgetSection.astro`, which mounts the existing vanilla
  TypeScript widgets on the four interactive pages.
- The widget modules are unchanged; `WidgetSection` imports them and dispatches by
  `data-widget`.
- Browser verification with Playwright against the dev server:
  - layer explorer: 6 bands, selection, keyboard arrow navigation
  - scope matrix: 9 cells, scenario switching, keyboard activation
  - lifecycle player: step controls, reduced-motion play
  - context flow: source toggles, eviction status
  - theme toggle and 7 source cards
  - no console or page errors
- The widget script is currently imported as one bundle on widget pages. Splitting per widget is
  a future optimization, not a correctness issue.

### 2026-11-11 — Phase 5 complete

- Rebuilt the landing page from the collection: hero, six-layer teaser, fact strip, ten generated
  chapter cards, and reading guidance.
- Added `ChapterCard.astro` and `src/data/landing.ts` for landing-only badge/CTA copy; new
  chapters fall back to their group name and a generic CTA.
- Added canonical URLs, Open Graph tags, and Twitter card metadata to `BaseLayout`.
- Added `JsonLd.astro` with `WebSite` structured data on the home page and `Article` plus
  `BreadcrumbList` on chapters.
- Added `public/og.png` (1200×630), generated from `public/og.svg`, for social previews.
- Added a base-aware `src/pages/robots.txt.ts` pointing at `sitemap-index.xml`.
- Confirmed the sitemap includes every chapter and uses the correct base path for both `/` and
  `/copilot-memory-layers/`.
- Verified canonical, OG image, JSON-LD, robots, and sitemap URLs under both base paths.
- Browser checks: 10 landing cards, 4 fact cards, 3 revealed sections, desktop/mobile layout, and
  all four widgets still working.
- Pagefind search is intentionally deferred; it is optional and not required for cutover.

**Not done yet:** the production deploy switch, removal of the legacy Vite site, and final
documentation/CI cleanup. Those remain Phase 6.

### Version decisions

| Package | Version | Reason |
| --- | --- | --- |
| Astro | 7.4.8 | Current major; no known audit findings |
| `@astrojs/mdx` | 8.1.3 | Matches Astro 7 |
| `@astrojs/sitemap` | 3.7.4 | Sitemap output for canonical URLs |
| `@astrojs/check` | 0.9.12 | Astro diagnostics |
| `@astrojs/markdown-remark` | 7.3.6 | Unified Markdown processor for the table-wrap plugin |
| Vite | 8.3.6 | Shared by Astro 7 and the legacy build |
| Node | 22.23.4 | Astro 7 engine minimum |

`dist-astro/` is temporary. At cutover, Astro should build directly to `dist/` and the legacy
Vite pipeline should be removed.

## 1. Why upgrade

The current site is a hand-registered static MPA. Adding one chapter requires seven edits:

1. create `<slug>/index.html`
2. add an entry to `src/content/nav.ts`
3. add the slug to `vite.config.ts`
4. add a card to `index.html`
5. update the hero chapter count
6. update `README.md`
7. add/verify citations in `src/content/sources.ts`

Removing a chapter is the reverse plus a link audit. This is structural overhead, not
incidental. The fix is not just a framework; it is moving from a **hand-registered MPA** to a
**content-driven static site**.

## 2. Recommendation

Adopt **Astro + MDX content collections + the existing vanilla TypeScript widgets as islands**.

- Reuse the current CSS, design tokens, and four `mountX(root)` widget modules.
- Generate routes, navigation, pager, landing cards, counts, TOC, and bibliographies from one
  content collection.
- Keep GitHub Pages compatibility with real static HTML per route.
- Preserve the dependency-free runtime ethos: JavaScript is limited to the small chrome
  initialiser and the existing widget modules; there is no runtime framework or router.

### Framework evaluation

| Option | Routing | GitHub Pages | Runtime JS | Fit |
| --- | --- | --- | --- | --- |
| **Astro** | File-based + content collections | Native static output | Zero by default; opt-in islands | ★★★★★ |
| Next.js (`output: 'export'`) | App Router | Works, but `basePath`, images, and client components need care | React runtime | ★★★☆ |
| SvelteKit (`adapter-static`) | File-based | Native prerender | Small | ★★★★ |
| VitePress | File-based | Native | Vue runtime | ★★★ |
| Eleventy | Config-driven | Native | Zero | ★★★ |
| React + Vite + React Router | Client router | Requires SPA 404 fallback | React runtime | ★★ |

Astro is the best fit for a content site with a few interactive diagrams. Next.js static export
is the fallback if the team is strongly React-first.

## 3. Target architecture

```text
/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── scripts/
│   └── check-links.mjs
├── src/
│   ├── pages/
│   │   ├── index.astro              # landing; cards generated from collection
│   │   ├── [...slug].astro          # all chapters; generated from collection
│   │   └── 404.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro         # head, theme, shell, topbar, sidebar, footer
│   │   └── ChapterLayout.astro      # page head, prose slot, TOC, pager, sources
│   ├── components/
│   │   ├── chrome/
│   │   │   ├── Topbar.astro
│   │   │   ├── Sidebar.astro
│   │   │   ├── Toc.astro
│   │   │   ├── Pager.astro
│   │   │   ├── Footer.astro
│   │   │   └── ThemeToggle.astro
│   │   ├── content/
│   │   │   ├── PageHead.astro
│   │   │   ├── Cite.astro
│   │   │   ├── SourceList.astro
│   │   │   ├── Callout.astro
│   │   │   ├── Badge.astro
│   │   │   ├── Figure.astro
│   │   │   └── TableWrap.astro
│   │   └── widgets/
│   │       ├── WidgetShell.astro
│   │       ├── LayerStack.astro
│   │       ├── ScopeMatrix.astro
│   │       ├── Lifecycle.astro
│   │       └── ContextFlow.astro
│   ├── content/
│   │   └── chapters/
│   │       ├── concepts/index.mdx
│   │       ├── layers/index.mdx
│   │       ├── local-memory/index.mdx
│   │       └── ...
│   ├── data/
│   │   ├── site.ts
│   │   ├── sources.ts
│   │   └── chapters.ts              # sorting, neighbors, numbering
│   ├── lib/
│   │   ├── url.ts                   # withBase(), chapterUrl()
│   │   └── seo.ts
│   ├── widgets/                     # existing vanilla TS, mostly unchanged
│   └── styles/
│       ├── tokens.css
│       ├── base.css
│       └── widgets.css
└── .github/
    └── workflows/deploy.yml
```

Root contains only config, docs, `public/`, and `src/`. Chapter material lives under
`src/content/chapters/`; route generation lives in `src/pages/`.

## 4. How the upgrade satisfies the goals

### Goal 1 — cleaner root and grouped chapters

- Content moves to `src/content/chapters/`.
- Routes move to `src/pages/`.
- Shared UI moves to `src/components/`, `src/layouts/`, `src/lib/`.
- URLs stay exactly as today: `/concepts/`, `/layers/`, etc. No redirects required.

### Goal 2 — no hand-written router or chrome

Astro provides:

- file-based routing;
- one dynamic `[...slug].astro` route for all chapters;
- layouts that render head, theme, topbar, sidebar, TOC, pager, and footer once;
- build-time TOC from rendered headings, replacing `buildToc()` and its DOM scan;
- build-time navigation HTML instead of runtime `mountChrome()` injection.

No client-side router is used, so GitHub Pages serves a real `index.html` for every route.

### Goal 3 — shared, reusable modules

| Module | Responsibility |
| --- | --- |
| `BaseLayout.astro` | `<head>`, theme boot, shell, sidebar, topbar, footer |
| `ChapterLayout.astro` | page head, prose container, TOC, pager, bibliography |
| `Sidebar` / `Topbar` / `Pager` / `Toc` | navigation surfaces |
| `Cite.astro` | resolves a source id and renders a numbered chip |
| `SourceList.astro` | renders the per-page bibliography from frontmatter |
| `Callout.astro` / `Badge.astro` / `Figure.astro` | recurring prose patterns |
| `WidgetShell.astro` | consistent widget title/hint/foot wrapper |
| `src/data/chapters.ts` | sorting, numbering, neighbors, groups |
| `src/data/sources.ts` | single citation registry |
| `src/lib/url.ts` | base-path-aware links |

The four existing widgets remain `mountX(root)` modules and do not need a rewrite.

## 5. Content model

Each chapter becomes one MDX file with validated frontmatter:

```mdx
---
title: Choosing the right layer
nav: Choosing a layer
group: Working with it
order: 8
description: Decision tables for memory versus instructions, local versus cloud, and skills versus prompts versus agents.
tone: violet
sources:
  - vscode-customization
  - gh-copilot-memory
---

import Cite from '@components/content/Cite.astro';
import Callout from '@components/content/Callout.astro';

Every “where should this knowledge live?” question has an answer, and it is rarely memory.

| If the knowledge is… | Put it in | Because |
| --- | --- | --- |
| A rule that must hold every time | Instructions, plus a hook or test | Instructions guide; hooks and tests enforce. |
| A command the whole team runs | Project instructions | Always included, reviewed once, versioned with the code. |

<Callout variant="warn" label="Neither is a guarantee">
  Guidance loaded into context can still be ignored.
  <Cite id="vscode-customization" />
</Callout>
```

Benefits:

- `order` replaces the duplicated `num`; the display number is computed with
  `String(order).padStart(2, '0')`.
- `group` is a schema enum, so a typo fails the build instead of hiding the chapter.
- `sources` drives the bibliography automatically; authors do not write a closing
  `data-sources` div.
- `<Cite>` validates the source id at build time; an unknown id fails the build instead of
  breaking runtime chrome.
- The TOC comes from rendered headings; no runtime heading scan.

### Content schema

```ts
// src/content.config.ts (Astro 7 content layer)
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const chapters = defineCollection({
  loader: glob({
    pattern: '*/index.mdx',
    base: './src/content/chapters',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: z.object({
    title: z.string(),
    nav: z.string(),
    group: z.enum(['Foundations', 'How memory behaves', 'Working with it']),
    order: z.number().int().positive(),
    blurb: z.string(),
    description: z.string(),
    lede: z.string().optional(),
    tone: z
      .enum(['l0', 'l1', 'l2', 'l3', 'l4', 'l5', 'accent', 'violet', 'warn'])
      .default('accent'),
    sources: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { chapters };
```

If the installed Astro major uses the older collections API, use `src/content/config.ts` and the
equivalent `defineCollection`/`getCollection` calls instead.

### Dynamic route

```astro
---
// src/pages/[...slug].astro
import { getCollection, render } from 'astro:content';
import ChapterLayout from '../layouts/ChapterLayout.astro';
import { sortChapters } from '../data/chapters';

export async function getStaticPaths() {
  const entries = sortChapters(
    await getCollection('chapters', ({ data }) => !data.draft),
  );
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: { entry, entries },
  }));
}

const { entry, entries } = Astro.props;
const { Content, headings } = await render(entry);
---

<ChapterLayout entry={entry} entries={entries} headings={headings}>
  <Content />
</ChapterLayout>
```

The landing page, sidebar, pager, and counts all derive from the same collection:

```astro
---
const entries = sortChapters(
  await getCollection('chapters', ({ data }) => !data.draft),
);
---
<p><strong>{entries.length}</strong> chapters</p>

{entries.map((entry) => (
  <a
    class="chapter-card"
    href={withBase(`${entry.id}/`)}
    style={`--tone: var(--${entry.data.tone})`}
  >
    <span class="chapter-card__num">{String(entry.data.order).padStart(2, '0')}</span>
    <h3>{entry.data.title}</h3>
    <p>{entry.data.description}</p>
  </a>
))}
```

## 6. Authoring workflow after the upgrade

### Add a chapter

1. Create `src/content/chapters/new-topic/index.mdx`.
2. Fill in frontmatter.
3. Write Markdown/MDX.
4. Add a source entry only if introducing a new official source.
5. Run `npm run dev` — sidebar, pager, landing card, TOC, and bibliography update
   automatically.

No `nav.ts` edit. No `vite.config.ts` edit. No landing-page edit. No README count edit.

### Remove a chapter

1. Delete `src/content/chapters/old-topic/`.
2. Remove source entries only if no other page uses them.
3. Build. Navigation, pager, cards, and counts update automatically.

### Add a source

Append to `src/data/sources.ts`. Citation numbering remains derived. Append rather than insert
if stable numbering matters.

### Add a reusable content pattern

Create a component in `src/components/content/`, expose it to MDX, and use it. Examples:
`<Callout>`, `<Figure>`, `<DecisionTable>`, `<Stat>`.

### Add a widget

1. Keep or create `src/widgets/myWidget.ts` with `mountMyWidget(root)`.
2. Create `src/components/widgets/MyWidget.astro` containing the host plus a `<script>` that
   imports and mounts it.
3. Use `<MyWidget />` in MDX inside `<WidgetShell>`.

Astro bundles each widget script only for pages that import it.

## 7. GitHub Pages compatibility

### `astro.config.mjs`

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const rawBase = process.env.BASE_PATH ?? '/';
const base = rawBase === '/' ? '/' : rawBase.replace(/\/$/, '');

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://example.github.io',
  base,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [mdx(), sitemap()],
});
```

- `build.format: 'directory'` produces `/concepts/index.html`.
- `trailingSlash: 'always'` keeps canonical URLs stable.
- `base` handles project sites (`/copilot-memory-layers`) and user sites (`/`).
- `site` is required for canonical URLs, Open Graph, and the sitemap.

### Base-aware links

```ts
// src/lib/url.ts
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base}${path.replace(/^\//, '')}`.replace(/\/{2,}/g, '/');
}
```

All generated navigation must use it so the site works at both `/` and `/repo/`.

### 404

`src/pages/404.astro` emits `dist/404.html`. GitHub Pages serves it for unknown paths. The
current path-guessing script in `404.html` can be deleted because `base` is known at build time.

### Deployment

Keep the manual pipeline so the link checker runs before upload:

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version-file: .nvmrc
    cache: npm
- run: npm ci
- id: pages
  uses: actions/configure-pages@v5
- run: npm run build
  env:
    BASE_PATH: ${{ steps.pages.outputs.base_path }}
    SITE_URL: https://${{ github.repository_owner }}.github.io
- run: npm run check:links
  env:
    BASE_PATH: ${{ steps.pages.outputs.base_path }}
- uses: actions/upload-pages-artifact@v3
  with:
    path: dist
```

Add a CI matrix that builds and link-checks both `BASE_PATH=/` and
`BASE_PATH=/copilot-memory-layers/`.

## 8. Migration plan

| Phase | Work | Output | Effort |
| --- | --- | --- | --- |
| **0. Baseline** | Screenshot every page in light/dark and mobile/desktop; record current links; create a branch | Parity reference | 0.5 day |
| **1. Scaffold** | Add Astro, MDX, sitemap; configure `base`, `site`, 404; deploy a one-page smoke build | GitHub Pages still works | **Complete** |
| **2. Layouts + data** | Build `BaseLayout`, `ChapterLayout`, chrome components, `chapters.ts`, `sources.ts`, URL helper | Chrome generated at build time | **Complete** |
| **3. Content conversion** | Convert chapters to MDX one at a time, starting with `sources`, `safety`, `compare`, then widget-heavy pages | All prose in collections | **Complete** |
| **4. Widgets** | Wrap each vanilla widget in an `.astro` component; verify keyboard, live regions, reduced motion | Feature parity | **Complete** |
| **5. Landing/SEO** | Generate landing cards/counts; add sitemap, canonical, OG, JSON-LD; optional Pagefind search | Complete static site | **Complete** |
| **6. Cutover** | Delete old HTML, `vite.config.ts`, `ui/chrome.ts`, unused `ui/anim.ts` pieces; update README and Copilot instructions | Clean codebase | 0.5 day |

**Total: roughly 6–8 developer-days.** Content conversion is most of the work; the framework
migration is fast because widgets and CSS are reusable.

Lower-risk variant: do Phases 1–2 with `.astro` pages and a single `chapters.ts` manifest first,
then convert to MDX in Phase 3. This gets routing/chrome/root-cleanliness benefits immediately,
with content conversion as a separate, reversible step.

## 9. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| MDX conversion causes visual drift | Build a component inventory first; use Playwright screenshots for page-by-page comparison |
| Astro API changes between majors | Pin Astro and integrations; commit the lockfile; upgrade deliberately |
| Base-path regressions | CI matrix for `/` and `/repo/`; keep `check-links.mjs` |
| SEO/canonical mistakes | Set `site`; test sitemap and canonical URLs in CI |
| Widget scripts load twice or not at all | One wrapper component per widget; smoke-test each page |
| Authors find MDX unfamiliar | Add `CONTRIBUTING.md` with a chapter template and component catalogue |
| Loss of the “no framework” ethos | Astro is build-time only; runtime JS is limited to the chrome initialiser and existing widgets; document that no runtime framework or router is added |
| URL changes break links | Keep existing slugs; if a slug changes, add a static redirect stub because GitHub Pages has no server redirects |

## 10. Additional improvements

1. **Pagefind search** — static index generated at build time, works on GitHub Pages.
2. **Sitemap, canonical, Open Graph, JSON-LD** — `@astrojs/sitemap` plus a small SEO component.
3. **Build-time validation** — content schema, citation ids, duplicate orders, missing sources.
4. **Automated accessibility tests** — Playwright + axe for every route; keyboard tests for widgets.
5. **Visual regression tests** — especially useful during the MDX migration.
6. **Content freshness check** — warn when a source’s `verifiedOn` is older than a threshold.
7. **Rehype plugins** — auto-wrap Markdown tables in `.table-wrap`; add `rel`/`target` to external links.
8. **Draft support** — `draft: true` excludes a chapter from nav, cards, and routes.
9. **“Edit this page” links** — point to the MDX file on GitHub.
10. **README cleanup** — remove the hand-maintained chapter table; link to
    `src/content/chapters/` and document the frontmatter fields.
11. **Update Copilot instructions** — rewrite `.github/copilot-instructions.md` and
    `.github/instructions/docs.instructions.md` for the Astro structure: “content lives in MDX,
    use components, never add chapter registries.”
12. **Optional PR previews** — GitHub Pages does not support them natively; Cloudflare Pages or
    Netlify can provide preview deployments alongside GitHub Pages production.

## 11. Acceptance criteria

The upgrade is successful when:

- Adding one valid MDX file automatically adds the chapter to the sidebar, pager, landing page,
  TOC, and bibliography.
- Deleting that folder removes every reference with no other edits.
- `npm run build` passes with both `BASE_PATH=/` and `BASE_PATH=/repo/`.
- `npm run check:links` passes for both base paths.
- An unknown citation id fails the build.
- All four widgets work with keyboard only and under `prefers-reduced-motion`.
- Runtime JavaScript is limited to the shared chrome initialiser and the existing widget modules.
- Visual parity is confirmed across light/dark and mobile/desktop.
- Lighthouse accessibility is at least 95, ideally 100.

## 12. Next step

Phases 1–5 are complete. Next is **Phase 6**: switch the GitHub Pages artifact from the legacy
`dist/` build to Astro, remove the legacy HTML/Vite chrome, update the README and agent
instructions for the final structure, and run the full verification suite one more time.
