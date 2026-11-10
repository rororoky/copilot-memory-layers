import { getCollection, type CollectionEntry } from 'astro:content';
import { chapters as legacyChapters, type Chapter } from '../data/chapters';
import { getSource } from '../data/sources';

export type ChapterEntry = CollectionEntry<'chapters'>;

let cachedEntries: Promise<ChapterEntry[]> | undefined;

/**
 * Load published chapters in order and validate them against the legacy chapter
 * manifest. The assertion is temporary: it keeps the Vite site and the Astro
 * collection in sync until the legacy site is removed at cutover.
 */
export function getChapterEntries(): Promise<ChapterEntry[]> {
  cachedEntries ??= getCollection('chapters', ({ data }) => !data.draft).then((entries) => {
    const sorted = [...entries].sort((a, b) => a.data.order - b.data.order);
    validateEntries(sorted);
    return sorted;
  });
  return cachedEntries;
}

export function entryToChapter(entry: ChapterEntry): Chapter {
  return {
    slug: entry.id,
    num: String(entry.data.order).padStart(2, '0'),
    title: entry.data.title,
    nav: entry.data.nav,
    group: entry.data.group,
    blurb: entry.data.blurb,
    tone: `var(--${entry.data.tone})`,
  };
}

export async function getChapters(): Promise<Chapter[]> {
  return (await getChapterEntries()).map(entryToChapter);
}

export async function getChapter(
  slug: string,
): Promise<{ entry: ChapterEntry; chapter: Chapter } | undefined> {
  const entry = (await getChapterEntries()).find((item) => item.id === slug);
  return entry ? { entry, chapter: entryToChapter(entry) } : undefined;
}

function validateEntries(entries: ChapterEntry[]): void {
  const orders = new Set<number>();

  for (const entry of entries) {
    if (orders.has(entry.data.order)) {
      throw new Error(`Duplicate chapter order ${entry.data.order} (${entry.id})`);
    }
    orders.add(entry.data.order);

    for (const source of entry.data.sources) {
      getSource(source);
    }
  }

  const actual = entries.map(entryToChapter);
  const expected = legacyChapters.map((chapter) => ({ ...chapter }));

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      [
        'Chapter collection does not match src/data/chapters.ts.',
        'Update the legacy manifest or the MDX frontmatter so they agree.',
        `Expected: ${JSON.stringify(expected)}`,
        `Actual:   ${JSON.stringify(actual)}`,
      ].join('\n'),
    );
  }
}
