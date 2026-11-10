/**
 * Legacy adapter for the Vite chrome.
 *
 * The framework-neutral data lives in `src/data/`. Keep this module as the
 * public API for legacy code until the Vite site is removed at cutover.
 */

import { withBase } from '../lib/url';

export type { Chapter } from '../data/chapters';
export {
  chapters,
  chapterBySlug,
  chapterIndex,
  chapterNeighbors,
  groups,
  topNavSlugs,
} from '../data/chapters';
export { site } from '../data/site';

/** Resolve a chapter slug to a deploy-base-aware URL. */
export function chapterHref(slug: string): string {
  return withBase(`${slug}/`);
}

export function homeHref(): string {
  return withBase();
}

export function currentSlug(): string {
  return document.body.dataset.page ?? 'home';
}
