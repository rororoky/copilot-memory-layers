/** Scroll-reveal and motion preference helpers used by every page. */

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function onReducedMotionChange(callback: (reduced: boolean) => void): void {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', (event) => callback(event.matches));
}

/**
 * Adds `.is-visible` the first time an element scrolls into view.
 * Elements match `.reveal` and may set `--reveal-delay` for stagger.
 */
export function observeReveals(root: ParentNode = document): void {
  const targets = Array.from(root.querySelectorAll<HTMLElement>('.reveal'));

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  targets.forEach((target) => observer.observe(target));
}

/** Observe elements and report the one currently closest to the viewport top. */
export function observeActiveSection(
  elements: HTMLElement[],
  onChange: (id: string) => void,
): void {
  if (elements.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    onChange(elements[0]!.id);
    return;
  }

  const visible = new Map<string, number>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).id;
        if (entry.isIntersecting) visible.set(id, entry.intersectionRatio);
        else visible.delete(id);
      }
      let bestId = '';
      let bestRatio = -1;
      for (const [id, ratio] of visible) {
        if (ratio > bestRatio) {
          bestId = id;
          bestRatio = ratio;
        }
      }
      if (bestId) onChange(bestId);
    },
    { rootMargin: '-84px 0px -58% 0px', threshold: [0.01, 0.2, 0.6] },
  );

  elements.forEach((element) => observer.observe(element));
}
