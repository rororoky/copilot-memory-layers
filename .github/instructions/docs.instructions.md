---
applyTo: '**/*.html'
---

# Documentation page rules (legacy HTML)

These apply to the legacy root chapter HTML until cutover. New chapter content belongs in
`src/content/chapters/**/*.mdx`; see `mdx.instructions.md` for that workflow.

## Head

- One `<h1>` per page, inside `.page-head`, preceded by an `.eyebrow` with the chapter number.
- The `<body data-page="...">` value must match the directory name; the sidebar uses it for the
  active state.
- Keep the inline theme script and the module script tag in every page. Pages are static HTML, not
  a client-side app.

## Body

- Wrap chapter content in `<div class="main__inner prose">`.
- Finish the page with a single `<div data-sources="..."></div>` listing the source ids used. The
  chrome turns it into citation cards.
- Interactive sections use a `<section class="widget">` with a `.widget__head` whose title is a
  `<p class="widget__title">`, not a heading. Headings inside widgets pollute the table of contents.
- Tables go inside `<div class="table-wrap">` so they scroll instead of overflowing.

## Voice

- Write for someone who has read the product docs and is still confused.
- Prefer "the docs say" over "the system does" when the mechanism is not public.
- Never claim a guarantee the documentation does not make.
