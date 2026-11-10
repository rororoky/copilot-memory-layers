import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeWrapTables from './src/lib/rehype-wrap-tables.mjs';

/**
 * Astro is the production site generator. It emits real static HTML to `dist/`,
 * so GitHub Pages serves a file per route without a client-side router.
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
  outDir: './dist',
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: {
    syntaxHighlight: false,
    processor: unified({ smartypants: false, rehypePlugins: [rehypeWrapTables] }),
  },
  integrations: [mdx(), sitemap()],
});
