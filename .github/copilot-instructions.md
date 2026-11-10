# Project instructions

This repository is a static, dependency-light educational site about GitHub Copilot's memory
layers. It is built with Vite and strict TypeScript, and it makes **no network requests at
runtime**.

## Commands

- `npm run dev` — legacy Vite dev server.
- `npm run build` — type-check, then build the legacy site to `dist/`.
- `npm run check:links` — verify internal links in `dist/`.
- `npm run dev:astro` — Astro dev server.
- `npm run verify:astro` — Astro check, build to `dist-astro/`, and link check.

## Non-negotiables

1. **Every factual claim needs a source.** Add or reuse an entry in `src/data/sources.ts`, then
   cite it with `<a data-cite="source-id"></a>` in legacy HTML, or `<Cite id="source-id" />` in
   Astro/MDX.
2. **Do not invent product behaviour.** If the official documentation does not say it, describe the
   gap instead of filling it.
3. **No runtime dependencies.** No analytics, fonts, CDNs, or API calls. Everything ships in the
   bundle.
4. **No runtime framework or client-side router.** Astro is a build-time scaffold only. Do not add
   React/Vue/Svelte or a client router. Prose pages must ship no JavaScript.
5. **Mark volatile features.** Anything Experimental or in Preview gets a badge.

## Structure

- `src/data/` — framework-neutral chapters, sources, and site metadata. Single source of truth.
- `src/content/` — legacy adapters over `src/data/` for the Vite build.
- `src/components/`, `src/layouts/`, `src/pages/` — Astro chrome and temporary routes.
- `src/ui/` — legacy site chrome, animation helpers, DOM utilities.
- `src/widgets/` — the four interactive diagrams. Each exports a `mountX(root)` function.
- `src/styles/` — tokens, base layout, widgets.
- `<chapter>/index.html` — legacy chapter pages; URLs stay clean on GitHub Pages.

## Accessibility

Widgets must be keyboard operable, announce state changes through a live region, and degrade
sensibly under `prefers-reduced-motion`.
