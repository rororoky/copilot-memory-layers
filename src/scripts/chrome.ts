import { observeActiveSection, observeReveals } from '../lib/motion';

const THEME_KEY = 'cml-theme';

function initTheme(): void {
  const root = document.documentElement;
  const button = document.querySelector<HTMLButtonElement>('#theme-toggle');
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

  const paint = (theme: 'dark' | 'light'): void => {
    root.dataset.theme = theme;
    if (meta) meta.content = theme === 'light' ? '#f6f8fb' : '#070a0f';
    if (button) {
      const next = theme === 'light' ? 'dark' : 'light';
      button.setAttribute('aria-label', `Switch to ${next} theme`);
      button.setAttribute('title', `Switch to ${next} theme`);
    }
  };

  paint(root.dataset.theme === 'light' ? 'light' : 'dark');

  button?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    paint(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage may be unavailable in private mode */
    }
  });
}

function initMobileNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>('#nav-toggle');
  const sidebar = document.querySelector<HTMLElement>('#sidebar');
  if (!toggle || !sidebar) return;

  const setOpen = (open: boolean): void => {
    sidebar.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setOpen(!sidebar.classList.contains('is-open')));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  document.addEventListener('click', (event) => {
    if (!sidebar.classList.contains('is-open')) return;
    const target = event.target as Node | null;
    if (!target) return;
    if (sidebar.contains(target) || toggle.contains(target)) return;
    setOpen(false);
  });

  sidebar.addEventListener('click', (event) => {
    if ((event.target as HTMLElement | null)?.closest('a')) setOpen(false);
  });
}

function initToc(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('#toc a[href^="#"]'));
  if (links.length === 0) return;

  const ids = new Set(links.map((link) => link.getAttribute('href')!.slice(1)));
  const headings = Array.from(
    document.querySelectorAll<HTMLElement>('#main h2[id], #main h3[id]'),
  ).filter((heading) => ids.has(heading.id));

  if (headings.length === 0) return;

  observeActiveSection(headings, (id) => {
    for (const link of links) {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  });
}

/** Initialise the shared chrome behaviour once per page. */
export function initChrome(): void {
  initTheme();
  initMobileNav();
  initToc();
  observeReveals();
}
