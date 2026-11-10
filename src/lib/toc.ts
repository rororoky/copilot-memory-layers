export interface TocHeading {
  depth: number;
  slug: string;
  text: string;
}

export interface TocItem {
  id: string;
  text: string;
  sub: TocItem[];
}

/**
 * Group rendered headings into an h2 -> h3 outline.
 * h1 is intentionally skipped; h3 before the first h2 is ignored.
 */
export function buildToc(headings: TocHeading[]): TocItem[] {
  const items: TocItem[] = [];

  for (const heading of headings) {
    const text = heading.text.trim();
    if (!heading.slug || !text) continue;

    if (heading.depth === 2) {
      items.push({ id: heading.slug, text, sub: [] });
    } else if (heading.depth === 3 && items.length > 0) {
      items[items.length - 1]!.sub.push({ id: heading.slug, text, sub: [] });
    }
  }

  return items;
}
