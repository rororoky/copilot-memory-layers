/**
 * Chapter view model and navigation constants.
 *
 * Chapter content and metadata live in the Astro collection at
 * `src/content/chapters/`. `src/lib/chapters.ts` maps collection entries into
 * this view model for the chrome components.
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

export const groups = ['Foundations', 'How memory behaves', 'Working with it'];

/** Chapters shown in the compact top navigation. */
export const topNavSlugs = ['layers', 'local-memory', 'lifecycle', 'instructions', 'sources'];
