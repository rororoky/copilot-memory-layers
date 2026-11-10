import {
  chapterHref,
  chapters,
  currentSlug,
  groups,
  homeHref,
  site,
  topNavSlugs,
} from '../content/nav';
import { getSource, sourceIndex } from '../content/sources';
import { observeActiveSection, observeReveals } from './anim';
import { escapeHtml, qsa, qs } from './dom';

/* ------------------------------------------------------------------ icons */

const ICON_SUN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>`;
const ICON_MOON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 13.4A8.5 8.5 0 1 1 10.6 3.5a7 7 0 0 0 9.9 9.9Z"/></svg>`;
const ICON_MENU = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`;
const ICON_BOOK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z"/><path d="M19 18v3H6.5A2.5 2.5 0 0 1 4 18.5"/></svg>`;
const ICON_MARK = `<svg class="brand__mark" viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="4.5" width="26" height="4.6" rx="2.3" fill="#a78bfa"/><rect x="3" y="11.2" width="26" height="4.6" rx="2.3" fill="#2dd4bf"/><rect x="3" y="17.9" width="26" height="4.6" rx="2.3" fill="#fbbf24"/><rect x="3" y="24.6" width="26" height="4.6" rx="2.3" fill="#60a5fa"/></svg>`;

/* ----------------------------------------------------------------- chrome */

export function mountChrome(): void {
  renderTopbar();
  renderSidebar();
  renderFooter();
  renderPager();
  enhanceCitations();
  renderSources();
  buildToc();
  initTheme();
  initMobileNav();
  observeReveals();
}

function renderTopbar(): void {
  const host = qs('#topbar');
  if (!host) return;
  const slug = currentSlug();

  const links = topNavSlugs
    .map((navSlug) => {
      const chapter = chapters.find((item) => item.slug === navSlug);
      if (!chapter) return '';
      const current = chapter.slug === slug ? ' aria-current="page"' : '';
      return `<a href="${chapterHref(chapter.slug)}"${current}>${escapeHtml(chapter.nav)}</a>`;
    })
    .join('');

  host.className = 'topbar';
  host.innerHTML = `
    <div class="topbar__inner">
      <button class="icon-btn nav-toggle" id="nav-toggle" type="button"
        aria-label="Open chapter navigation" aria-expanded="false" aria-controls="sidebar">${ICON_MENU}</button>
      <a class="brand" href="${homeHref()}">
        ${ICON_MARK}
        <span class="brand__title">Copilot <span>Memory Layers</span></span>
      </a>
      <nav class="topnav" aria-label="Primary">
        <a href="${homeHref()}"${slug === 'home' ? ' aria-current="page"' : ''}>Overview</a>
        ${links}
      </nav>
      <div class="topbar__actions">
        <a class="icon-btn" href="${chapterHref('sources')}" aria-label="Official sources" title="Official sources">${ICON_BOOK}</a>
        <button class="icon-btn" id="theme-toggle" type="button" aria-label="Switch colour theme">${ICON_SUN}</button>
      </div>
    </div>`;
}

function renderSidebar(): void {
  const host = qs('#sidebar');
  if (!host) return;
  const slug = currentSlug();

  const groupsHtml = groups
    .map((group) => {
      const items = chapters
        .filter((chapter) => chapter.group === group)
        .map((chapter) => {
          const current = chapter.slug === slug ? ' aria-current="page"' : '';
          return `<li><a href="${chapterHref(chapter.slug)}"${current}>
            <span class="nav-list__num">${chapter.num}</span>
            <span>${escapeHtml(chapter.nav)}</span>
          </a></li>`;
        })
        .join('');

      return `<div class="nav-group">
        <p class="nav-group__label">${escapeHtml(group)}</p>
        <ul class="nav-list">${items}</ul>
      </div>`;
    })
    .join('');

  host.className = 'sidebar';
  host.innerHTML = `
    <div class="nav-group">
      <ul class="nav-list">
        <li><a href="${homeHref()}"${slug === 'home' ? ' aria-current="page"' : ''}>
          <span class="nav-list__num">00</span><span>Overview</span>
        </a></li>
      </ul>
    </div>
    ${groupsHtml}
    <div class="sidebar__foot">
      <p><strong>Built from official documentation.</strong><br />
      Every claim is cited. Last verified ${site.verifiedOn}.</p>
    </div>`;
}

function renderFooter(): void {
  const host = qs('#footer');
  if (!host) return;
  host.innerHTML = `
    <div class="site-footer__inner">
      <p>An independent educational resource. Not affiliated with or endorsed by GitHub or Microsoft.
      Product behaviour changes — always confirm against the linked official documentation.</p>
      <nav aria-label="Footer">
        <a href="${chapterHref('sources')}">Sources</a>
        <a href="${chapterHref('safety')}">Safety</a>
        <a href="${chapterHref('compare')}">Decision tables</a>
      </nav>
    </div>`;
}

function renderPager(): void {
  const slug = currentSlug();
  const index = chapters.findIndex((chapter) => chapter.slug === slug);
  if (index === -1) return;

  const host = qs('#main .main__inner');
  if (!host) return;

  const prev = chapters[index - 1];
  const next = chapters[index + 1];
  const pager = document.createElement('nav');
  pager.className = 'pager';
  pager.setAttribute('aria-label', 'Chapter navigation');
  pager.innerHTML = `
    ${prev
      ? `<a href="${chapterHref(prev.slug)}"><span>Previous</span>${escapeHtml(prev.title)}</a>`
      : `<a href="${homeHref()}"><span>Back to</span>Overview</a>`}
    ${next
      ? `<a href="${chapterHref(next.slug)}"><span>Next</span>${escapeHtml(next.title)}</a>`
      : `<a href="${chapterHref('sources')}"><span>Reference</span>Sources and method</a>`}`;
  host.append(pager);
}

/** Turns `<a data-cite="source-id"></a>` into a numbered citation chip. */
function enhanceCitations(): void {
  qsa<HTMLAnchorElement>('[data-cite]').forEach((chip) => {
    const id = chip.dataset.cite ?? '';
    const source = getSource(id);
    chip.classList.add('cite');
    chip.href = `#src-${id}`;
    chip.textContent = String(sourceIndex(id));
    chip.setAttribute('aria-label', `Source ${sourceIndex(id)}: ${source.title}`);
    chip.title = `${source.title} — ${source.publisher}`;
  });
}

function renderSources(): void {
  const holder = qs('[data-sources]');
  if (!holder) return;

  const ids = (holder.getAttribute('data-sources') ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) return;
  const unique = [...new Set(ids)];

  const cards = unique
    .map((id) => {
      const source = getSource(id);
      return `<li class="source-card" id="src-${id}">
        <span class="source-card__index">${sourceIndex(id)}</span>
        <div>
          <p class="source-card__title"><a href="${source.url}" rel="noreferrer noopener" target="_blank">${escapeHtml(source.title)}</a></p>
          <p class="source-card__meta">${escapeHtml(source.publisher)} · ${escapeHtml(source.usedFor)}</p>
        </div>
        <span class="badge source-card__verified">checked ${source.verifiedOn}</span>
      </li>`;
    })
    .join('');

  holder.className = 'page-sources';
  holder.innerHTML = `
    <p class="page-sources__title">Official sources for this page</p>
    <p class="page-sources__note">Each item links to the page it was read from. Dates are verification dates, not publication dates.</p>
    <ol class="source-list">${cards}</ol>`;
}

/* -------------------------------------------------------------------- toc */

function buildToc(): void {
  const host = qs('#toc');
  const main = qs('#main');
  if (!host || !main) return;

  const headings = qsa<HTMLHeadingElement>('#main h2, #main h3', main);
  if (headings.length < 2) return;

  interface Item {
    id: string;
    text: string;
    sub: Array<{ id: string; text: string }>;
  }

  const items: Item[] = [];
  for (const heading of headings) {
    if (!heading.id) heading.id = slugify(heading.textContent ?? '');
    const id = heading.id;
    const text = heading.textContent?.trim() ?? '';
    if (heading.tagName === 'H2') {
      items.push({ id, text, sub: [] });
    } else if (items.length > 0) {
      items[items.length - 1]!.sub.push({ id, text });
    }
  }

  const list = items
    .map((item) => {
      const sub = item.sub.length
        ? `<ol class="toc__sub">${item.sub
            .map((child) => `<li><a href="#${child.id}">${escapeHtml(child.text)}</a></li>`)
            .join('')}</ol>`
        : '';
      return `<li><a href="#${item.id}">${escapeHtml(item.text)}</a>${sub}</li>`;
    })
    .join('');

  host.innerHTML = `<p class="toc__label">On this page</p><ol>${list}</ol>`;

  const links = qsa<HTMLAnchorElement>('a', host);
  const observerTargets = headings.filter((heading) => heading.id);
  observeActiveSection(observerTargets, (id) => {
    links.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* ------------------------------------------------------------------ theme */

function initTheme(): void {
  const root = document.documentElement;
  const button = qs<HTMLButtonElement>('#theme-toggle');

  const paint = (theme: 'dark' | 'light') => {
    root.dataset.theme = theme;
    const meta = qs<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'light' ? '#f6f8fb' : '#070a0f';
    if (button) {
      button.innerHTML = theme === 'light' ? ICON_MOON : ICON_SUN;
      button.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
      button.setAttribute('title', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
    }
  };

  paint(root.dataset.theme === 'light' ? 'light' : 'dark');

  button?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    paint(next);
    try {
      localStorage.setItem('cml-theme', next);
    } catch {
      /* storage may be unavailable in private mode */
    }
  });
}

/* ------------------------------------------------------------- mobile nav */

function initMobileNav(): void {
  const toggle = qs<HTMLButtonElement>('#nav-toggle');
  const sidebar = qs('#sidebar');
  if (!toggle || !sidebar) return;

  const setOpen = (open: boolean) => {
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
