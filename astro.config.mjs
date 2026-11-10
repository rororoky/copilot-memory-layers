import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeWrapTables from './src/lib/rehype-wrap-tables.mjs';

/**
 * Phase 1 scaffold.
 *
 * The legacy Vite site still builds to `dist/`. Astro builds to `dist-astro/`
 * until the migration reaches cutover, so production remains deployable.
 *
 * BASE_PATH is supplied by the GitHub Pages workflow:
 *   /                      -> user or organisation site
 *   /copilot-memory-layers -> project site
 */
const rawBase = process.env.BASE_PATH || '/';
const base = rawBase === '/' ? '/' : rawBase.replace(/\/+$/, '');

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://rororoky.github.io',
  base,
  output: 'static',
  outDir: './dist-astro',
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: {
    syntaxHighlight: false,
    processor: unified({ smartypants: false, rehypePlugins: [rehypeWrapTables] }),
  },
  integrations: [mdx(), sitemap()],
});
