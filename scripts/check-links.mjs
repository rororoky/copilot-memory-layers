/**
 * Internal link checker for the built site. No dependencies.
 *
 *   npm run build && npm run check:links
 *   node scripts/check-links.mjs dist-astro
 *
 * Resolves relative and base-prefixed URLs against the output directory and
 * reports anything that would 404 on GitHub Pages. Pass the output directory as
 * the first argument, or set DIST_DIR; the default is dist/.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

const DIST = resolve(process.argv[2] ?? process.env.DIST_DIR ?? 'dist');
const BASE = normalizeBase(process.env.BASE_PATH ?? '/');

function normalizeBase(value) {
  if (!value.startsWith('/')) value = `/${value}`;
  if (!value.endsWith('/')) value = `${value}/`;
  return value;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

async function exists(target) {
  try {
    const info = await stat(target);
    if (info.isDirectory()) {
      const index = join(target, 'index.html');
      await stat(index);
    }
    return true;
  } catch {
    return false;
  }
}

function extractLinks(html) {
  const links = new Set();
  const pattern = /(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    links.add(match[1]);
  }
  return links;
}

const files = (await walk(DIST)).filter((file) => file.endsWith('.html'));
const problems = [];

for (const file of files) {
  const html = await readFile(file, 'utf8');
  for (const raw of extractLinks(html)) {
    if (!raw || raw.startsWith('#')) continue;
    if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(raw)) continue;

    const withoutSuffix = raw.split('#')[0].split('?')[0];
    if (!withoutSuffix) continue;

    let target;
    let display = raw;

    if (withoutSuffix.startsWith('/')) {
      display = `(base) ${withoutSuffix}`;
      if (!withoutSuffix.startsWith(BASE)) {
        // Absolute URL outside the deploy base — flag it, Pages would 404.
        problems.push({ file: relative(DIST, file), link: display, reason: `outside base ${BASE}` });
        continue;
      }
      target = join(DIST, withoutSuffix.slice(BASE.length));
    } else {
      target = resolve(dirname(file), withoutSuffix);
    }

    if (!(await exists(target))) {
      problems.push({ file: relative(DIST, file), link: display, reason: 'missing target' });
    }
  }
}

if (problems.length === 0) {
  console.log(`Checked ${files.length} HTML files — no broken internal links.`);
  process.exit(0);
}

console.error(`Found ${problems.length} broken internal link(s):\n`);
for (const problem of problems) {
  console.error(`  ${problem.file} → ${problem.link} (${problem.reason})`);
}
process.exit(1);
