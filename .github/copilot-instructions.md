# Project instructions

This repository is a static, dependency-light educational site about GitHub Copilot's memory
layers. It is built with Vite and strict TypeScript, and it makes **no network requests at
runtime**.

## Commands

- `npm run dev` — local dev server.
- `npm run build` — type-check, then build to `dist/`.
- `npm run check:links` — verify internal links in `dist/`.

## Non-negotiables

1. **Every factual claim needs a source.** Add or reuse an entry in `src/content/sources.ts`, then
   cite it with `<a data-cite="source-id"></a>` or a `data-sources="..."` list at the end of the page.
2. **Do not invent product behaviour.** If the official documentation does not say it, describe the
   gap instead of filling it.
3. **No runtime dependencies.** No analytics, fonts, CDNs, or API calls. Everything ships in the
   bundle.
4. **No framework.** The site is vanilla TypeScript on purpose; keep it that way.
5. **Mark volatile features.** Anything Experimental or in Preview gets a badge.

## Structure

- `src/content/` — navigation and the source registry. Single source of truth.
- `src/ui/` — site chrome, animation helpers, DOM utilities.
- `src/widgets/` — the four interactive diagrams. Each exports a `mountX(root)` function.
- `src/styles/` — tokens, base layout, widgets.
- `<chapter>/index.html` — one directory per chapter, so URLs stay clean on GitHub Pages.

## Accessibility

Widgets must be keyboard operable, announce state changes through a live region, and degrade
sensibly under `prefers-reduced-motion`.
