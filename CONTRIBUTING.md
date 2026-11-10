# Contributing

Thanks for helping make this guide more accurate. Corrections are more valuable than additions.

## Reporting an error

Open an issue with:

1. The page URL.
2. The sentence that is wrong.
3. The official page that contradicts it, and the date you checked.

If the documentation has changed, the documentation wins.

## Adding a chapter

1. Create `src/content/chapters/<slug>/index.mdx` using an existing chapter as the template.
2. Add frontmatter: `title`, `nav`, `group`, `order`, `blurb`, `description`, `tone`, and the
   `sources` ids you cite. See `.github/instructions/mdx.instructions.md`.
3. Write the body as Markdown/MDX. Start with an `<h2>`; the layout renders the page header.
4. Add any new sources to `src/data/sources.ts` **before** citing them.
5. Run `npm run verify`.

Navigation, the pager, TOC, chapter cards, and the bibliography are generated from the collection.

## Adding a source

Sources live in `src/data/sources.ts`:

```ts
{
  id: 'short-kebab-id',
  title: 'Exact page title',
  publisher: 'Visual Studio Code', // or 'GitHub'
  url: 'https://…',
  verifiedOn: 'YYYY-MM-DD',
  usedFor: 'What this site uses the page for.',
}
```

Then cite it in MDX with `<Cite id="short-kebab-id" />` and add the same id to the chapter's
frontmatter `sources`.

## Style

- Write for a reader who knows the product and is still confused by the terminology.
- One idea per paragraph. Prefer concrete examples over abstract description.
- Do not add a runtime dependency. Astro is the build tool; the runtime must stay dependency-free.
- Do not add a runtime framework or client-side router.
- Widgets must remain keyboard operable and honour `prefers-reduced-motion`.

## Checks

```bash
npm run verify
```

This runs `astro check`, builds to `dist/`, and verifies internal links. It must pass before a pull
request is merged.
