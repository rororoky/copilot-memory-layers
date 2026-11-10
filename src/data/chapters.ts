/**
 * Framework-neutral chapter manifest.
 *
 * Phase 3 replaces this with an Astro content collection. Until then, both the
 * legacy Vite chrome and the Astro chrome read from this single list.
 */

export interface Chapter {
  /** Directory name; the page lives at /<slug>/ */
  slug: string;
  /** Display number, e.g. "01" */
  num: string;
  /** Full title used in headings, cards, and the pager */
  title: string;
  /** Short label used in the sidebar and top navigation */
  nav: string;
  /** Sidebar group */
  group: string;
  /** One-line description */
  blurb: string;
  /** CSS custom property used as the accent for this chapter */
  tone: string;
}

export const chapters: Chapter[] = [
  {
    slug: 'concepts',
    num: '01',
    title: 'Memory, context, and instructions',
    nav: 'Foundations',
    group: 'Foundations',
    blurb:
      'Three different things share the word “memory”. Separating them is the key to reading every other page.',
    tone: 'var(--l0)',
  },
  {
    slug: 'layers',
    num: '02',
    title: 'The six layers',
    nav: 'The six layers',
    group: 'Foundations',
    blurb:
      'From model weights to reviewed instruction files: what each layer holds, how long it lives, and who can see it.',
    tone: 'var(--l1)',
  },
  {
    slug: 'local-memory',
    num: '03',
    title: 'Local memory scopes',
    nav: 'Local memory scopes',
    group: 'How memory behaves',
    blurb:
      'Session, repository, and user memory files: what survives a new chat, a different workspace, or a different person.',
    tone: 'var(--l2)',
  },
  {
    slug: 'cloud-memory',
    num: '04',
    title: 'Cloud Copilot Memory',
    nav: 'Cloud memory',
    group: 'How memory behaves',
    blurb:
      'Repository facts and user preferences stored by GitHub: who writes them, who can read them, and how they are cited.',
    tone: 'var(--l3)',
  },
  {
    slug: 'lifecycle',
    num: '05',
    title: 'Memory lifecycle',
    nav: 'Lifecycle',
    group: 'How memory behaves',
    blurb:
      'Capture, store, recall, validate, vote, expire. Step through the path a single memory takes.',
    tone: 'var(--l4)',
  },
  {
    slug: 'context',
    num: '06',
    title: 'Context assembly',
    nav: 'Context assembly',
    group: 'How memory behaves',
    blurb:
      'Instructions, skills, memory, and conversation all compete for the same context window. Watch what gets in.',
    tone: 'var(--accent)',
  },
  {
    slug: 'instructions',
    num: '07',
    title: 'The instruction layer',
    nav: 'Instruction layer',
    group: 'Working with it',
    blurb:
      'Repository-owned, version-controlled guidance: instructions, prompts, skills, custom agents, and hooks.',
    tone: 'var(--l5)',
  },
  {
    slug: 'compare',
    num: '08',
    title: 'Choosing the right layer',
    nav: 'Choosing a layer',
    group: 'Working with it',
    blurb:
      'Decision tables for memory versus instructions, local versus cloud, and skills versus prompts versus agents.',
    tone: 'var(--violet)',
  },
  {
    slug: 'safety',
    num: '09',
    title: 'Safety, trust, and retention',
    nav: 'Safety and retention',
    group: 'Working with it',
    blurb:
      'What is never stored, how stale facts are caught, how long memories live, and what administrators control.',
    tone: 'var(--warn)',
  },
  {
    slug: 'sources',
    num: '10',
    title: 'Sources and method',
    nav: 'Sources',
    group: 'Working with it',
    blurb:
      'Every official article this site is built from, with the date each was last checked.',
    tone: 'var(--accent)',
  },
];

export const groups = ['Foundations', 'How memory behaves', 'Working with it'];

/** Chapters shown in the compact top navigation. */
export const topNavSlugs = ['layers', 'local-memory', 'lifecycle', 'instructions', 'sources'];

export function chapterBySlug(slug: string): Chapter | undefined {
  return chapters.find((chapter) => chapter.slug === slug);
}

export function chapterIndex(slug: string): number {
  return chapters.findIndex((chapter) => chapter.slug === slug);
}

export function chapterNeighbors(slug: string): { prev?: Chapter; next?: Chapter } {
  const index = chapterIndex(slug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? chapters[index - 1] : undefined,
    next: index < chapters.length - 1 ? chapters[index + 1] : undefined,
  };
}
