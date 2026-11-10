---
applyTo: 'src/content/chapters/**/*.mdx'
---

# Chapter MDX rules

These apply to every migrated chapter. The layout renders the page head, TOC, pager, and source
list; the MDX body supplies the chapter prose.

## Frontmatter

Required:

- `title` — full chapter title.
- `nav` — short sidebar/top-nav label.
- `group` — one of `Foundations`, `How memory behaves`, `Working with it`.
- `order` — positive integer; drives sorting, the display number, and the pager.
- `blurb` — one short card description.
- `description` — meta description for search and social previews.
- `tone` — one of `l0`–`l5`, `accent`, `violet`, `warn`.
- `sources` — every source id cited on the page.

Optional:

- `lede` — the visible page introduction; falls back to `description`.
- `draft` — exclude the chapter from the collection and navigation.

Do not add `num` or `slug`. Both are derived from `order` and the directory name.

## Body

- Start with an `<h2>`. Do not add an `<h1>` or a `.page-head`; `ChapterLayout` renders them.
- Use `<Cite id="source-id" />` for citations. The id must also appear in frontmatter `sources`.
- Use `<Callout variant="note|warn|rule" label="...">` for callouts.
- Use `<Figure caption="...">` for diagrams. The component supplies `.diagram.reveal`.
- Use `<WidgetSection id="layer-stack|scope-matrix|lifecycle|context-flow" title="..." hint="..." />`
  for the four interactive diagrams.
- Use plain Markdown tables. The build wraps them in `.table-wrap`.
- Use fenced code blocks. Syntax highlighting is disabled so the site's own token styling applies.
- Import components with a relative path from the chapter directory, for example:
  ```mdx
  import Cite from '../../../components/content/Cite.astro';
  ```
- Preview links and assets must use `withBase()` if they are written in Astro code. Inside MDX,
  use normal relative links or the shared components.

## Accuracy

- Every factual claim needs a source. Cite the exact official page, not a summary or blog post.
- Do not invent behaviour that the documentation does not state.
- Mark Experimental or Preview features with a badge.
- Keep the prose voice consistent with the existing chapters: direct, specific, and explicit about
  uncertainty.
