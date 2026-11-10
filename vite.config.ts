import { defineConfig } from 'vite';
import { resolve } from 'node:path';

/**
 * Every chapter is a real directory with its own index.html so that GitHub Pages
 * serves clean URLs and a page reload never needs a client-side router.
 */
const chapters = [
  'concepts',
  'layers',
  'local-memory',
  'cloud-memory',
  'lifecycle',
  'instructions',
  'context',
  'compare',
  'safety',
  'sources',
];

const input: Record<string, string> = {
  home: resolve(__dirname, 'index.html'),
  notFound: resolve(__dirname, '404.html'),
};

for (const chapter of chapters) {
  input[chapter] = resolve(__dirname, chapter, 'index.html');
}

export default defineConfig({
  // For project pages set BASE_PATH=/<repo-name>/ in the workflow.
  base: process.env.BASE_PATH ?? '/',
  appType: 'mpa',
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsInlineLimit: 2048,
    rollupOptions: { input },
  },
  server: { port: 5173, open: false },
});
