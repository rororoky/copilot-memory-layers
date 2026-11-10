import type { Chapter } from './chapters';

export interface CardMeta {
  badge: string;
  cta: string;
}

/**
 * Landing-card presentation metadata. Kept out of chapter frontmatter because it
 * is editorial UI copy, not document metadata. New chapters fall back to the
 * group name and a generic CTA.
 */
export const cardMeta: Record<string, CardMeta> = {
  concepts: { badge: 'Foundations', cta: 'Read chapter →' },
  layers: { badge: 'Foundations', cta: 'Open the explorer →' },
  'local-memory': { badge: 'Scopes', cta: 'Test the matrix →' },
  'cloud-memory': { badge: 'Cloud', cta: 'Read chapter →' },
  lifecycle: { badge: 'Mechanics', cta: 'Run the player →' },
  context: { badge: 'Mechanics', cta: 'Toggle the sources →' },
  instructions: { badge: 'Practice', cta: 'Read chapter →' },
  compare: { badge: 'Practice', cta: 'Use the tables →' },
  safety: { badge: 'Trust', cta: 'Read chapter →' },
  sources: { badge: 'Reference', cta: 'See the citations →' },
};

export function cardFor(chapter: Pick<Chapter, 'slug' | 'group'>): CardMeta {
  return cardMeta[chapter.slug] ?? { badge: chapter.group, cta: 'Read chapter →' };
}
