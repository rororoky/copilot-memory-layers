# Contributing

Thanks for helping make this guide more accurate. Corrections are more valuable than additions.

## Reporting an error

Open an issue with:

1. The page URL.
2. The sentence that is wrong.
3. The official page that contradicts it, and the date you checked.

If the documentation has changed, the documentation wins.

## Adding a chapter

1. Add an entry to `src/content/nav.ts` with a unique `slug`, `num`, `group`, and `tone`.
2. Add the slug to the `chapters` array in `vite.config.ts` so it becomes a build input.
3. Create `<slug>/index.html` using an existing chapter as the template.
4. Add any new sources to `src/content/sources.ts` **before** citing them.
5. Finish the page with `<div data-sources="...">` listing the ids you used.

## Adding a source

Sources live in `src/content/sources.ts`:

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

Then cite it anywhere with `<a class="cite" data-cite="short-kebab-id"></a>`.

## Style

- Write for a reader who knows the product and is still confused by the terminology.
- One idea per paragraph. Prefer concrete examples over abstract description.
- Do not add a runtime dependency. No frameworks, fonts, analytics, or CDN links.
- Widgets must remain keyboard operable and honour `prefers-reduced-motion`.

## Checks

```bash
npm run build
npm run check:links
```

Both must pass before a pull request is merged.
