import { h, qs } from '../lib/dom';

type CellState = 'kept' | 'cleared' | 'private' | 'stale' | 'na';

interface Cell {
  state: CellState;
  text: string;
}

interface Column {
  id: string;
  label: string;
  sub: string;
}

interface Row {
  id: string;
  label: string;
  sub: string;
}

interface Scenario {
  id: string;
  label: string;
  note: string;
}

const COLUMNS: Column[] = [
  { id: 'local', label: 'Local memory files', sub: '/memories/' },
  { id: 'cloud', label: 'Cloud Copilot Memory', sub: 'GitHub' },
  { id: 'instructions', label: 'Source-controlled', sub: 'instructions' },
];

const ROWS: Row[] = [
  { id: 'session', label: 'Session', sub: '/memories/session/' },
  { id: 'repo', label: 'Repository', sub: '/memories/repo/' },
  { id: 'user', label: 'User', sub: '/memories/' },
];

const SCENARIOS: Scenario[] = [
  {
    id: 'baseline',
    label: 'Nothing changes',
    note: 'Where each kind of knowledge lives before anything happens.',
  },
  {
    id: 'new-session',
    label: 'Start a new chat',
    note: 'A new conversation in the same window. Session memory is discarded; everything durable is reloaded.',
  },
  {
    id: 'switch-workspace',
    label: 'Open another repository',
    note: 'Repository-scoped knowledge stays behind. User-scoped knowledge and reviewed instruction files travel with you.',
  },
  {
    id: 'other-person',
    label: 'A different developer',
    note: 'The dividing line between knowledge that is shared and knowledge that is personal.',
  },
  {
    id: 'idle',
    label: '30 days idle',
    note: 'What decay looks like. Cloud facts expire after a default of 90 days; local files have no documented expiry.',
  },
];

const CELLS: Record<string, Record<string, Record<string, Cell>>> = {
  session: {
    local: {
      baseline: { state: 'kept', text: 'Scratch notes' },
      'new-session': { state: 'cleared', text: 'Emptied' },
      'switch-workspace': { state: 'cleared', text: 'Emptied' },
      'other-person': { state: 'private', text: 'Never persisted' },
      idle: { state: 'cleared', text: 'Emptied' },
    },
    cloud: {
      baseline: { state: 'na', text: 'No session scope' },
      'new-session': { state: 'na', text: 'No session scope' },
      'switch-workspace': { state: 'na', text: 'No session scope' },
      'other-person': { state: 'na', text: 'No session scope' },
      idle: { state: 'na', text: 'No session scope' },
    },
    instructions: {
      baseline: { state: 'kept', text: 'Always available' },
      'new-session': { state: 'kept', text: 'Unchanged' },
      'switch-workspace': { state: 'cleared', text: 'Repo files only' },
      'other-person': { state: 'kept', text: 'Same repo, same files' },
      idle: { state: 'kept', text: 'Versioned' },
    },
  },
  repo: {
    local: {
      baseline: { state: 'kept', text: 'Project notes' },
      'new-session': { state: 'kept', text: 'Reloaded' },
      'switch-workspace': { state: 'cleared', text: 'Other workspace' },
      'other-person': { state: 'private', text: 'Local only' },
      idle: { state: 'kept', text: 'No documented expiry' },
    },
    cloud: {
      baseline: { state: 'kept', text: 'Repository fact' },
      'new-session': { state: 'kept', text: 'Recalled at start' },
      'switch-workspace': { state: 'cleared', text: 'Repo-scoped' },
      'other-person': { state: 'kept', text: 'Shared with repo access' },
      idle: { state: 'stale', text: '90-day expiry' },
    },
    instructions: {
      baseline: { state: 'kept', text: 'Reviewed rules' },
      'new-session': { state: 'kept', text: 'Unchanged' },
      'switch-workspace': { state: 'cleared', text: 'Lives in that repo' },
      'other-person': { state: 'kept', text: 'Anyone with access' },
      idle: { state: 'kept', text: 'No expiry' },
    },
  },
  user: {
    local: {
      baseline: { state: 'kept', text: 'Preferences' },
      'new-session': { state: 'kept', text: 'Reloaded' },
      'switch-workspace': { state: 'kept', text: 'Follows you' },
      'other-person': { state: 'private', text: 'On your machine' },
      idle: { state: 'kept', text: 'No documented expiry' },
    },
    cloud: {
      baseline: { state: 'kept', text: 'Preference' },
      'new-session': { state: 'kept', text: 'Recalled at start' },
      'switch-workspace': { state: 'kept', text: 'Follows you' },
      'other-person': { state: 'private', text: 'Private to you' },
      idle: { state: 'stale', text: '90-day expiry' },
    },
    instructions: {
      baseline: { state: 'kept', text: 'User-level guidance' },
      'new-session': { state: 'kept', text: 'Unchanged' },
      'switch-workspace': { state: 'kept', text: 'Follows your profile' },
      'other-person': { state: 'private', text: 'Not shared' },
      idle: { state: 'kept', text: 'No expiry' },
    },
  },
};

const ICONS: Record<CellState, string> = {
  kept: '✓',
  cleared: '×',
  private: '•',
  stale: '!',
  na: '–',
};

export function mountScopeMatrix(root: HTMLElement): void {
  let current = SCENARIOS[0]!.id;

  const scenarioBar = h('div', { class: 'segmented', role: 'group', 'aria-label': 'Change the situation' });
  const buttons = SCENARIOS.map((scenario) => {
    const button = h('button', {
      type: 'button',
      text: scenario.label,
      'aria-pressed': String(scenario.id === current),
    }) as HTMLButtonElement;
    button.dataset.scenario = scenario.id;
    button.addEventListener('click', () => {
      if (current === scenario.id) return;
      current = scenario.id;
      buttons.forEach((item) =>
        item.setAttribute('aria-pressed', String(item.dataset.scenario === current)),
      );
      paint();
    });
    scenarioBar.append(button);
    return button;
  });

  const table = h('table', { class: 'matrix' });
  const thead = h('thead');
  const headRow = h('tr', {}, [h('th', { scope: 'col', text: 'Memory scope' })]);
  for (const column of COLUMNS) {
    headRow.append(
      h('th', { scope: 'col', html: `${column.label}<br /><span class="mono muted">${column.sub}</span>` }),
    );
  }
  thead.append(headRow);

  const tbody = h('tbody');
  const cells = new Map<string, HTMLDivElement>();

  for (const row of ROWS) {
    const tr = h('tr', {}, [
      h('th', { scope: 'row', html: `${row.label}<span>${row.sub}</span>` }),
    ]);
    for (const column of COLUMNS) {
      const cell = h('div', { class: 'mcell' });
      cells.set(`${row.id}:${column.id}`, cell);
      tr.append(h('td', {}, [cell]));
    }
    tbody.append(tr);
  }

  table.append(thead, tbody);

  const wrap = h('div', { class: 'matrix-wrap' }, [table]);
  const note = h('p', { class: 'matrix-note', 'aria-live': 'polite' });
  const status = h('p', { class: 'widget__hint', 'aria-live': 'polite' });

  const paint = (): void => {
    const scenario = SCENARIOS.find((item) => item.id === current)!;
    for (const row of ROWS) {
      for (const column of COLUMNS) {
        const cell = cells.get(`${row.id}:${column.id}`);
        if (!cell) continue;
        const data = CELLS[row.id]?.[column.id]?.[current] ?? { state: 'na', text: '—' };
        cell.className = `mcell mcell--${data.state}`;
        cell.innerHTML = `<span class="mcell__icon" aria-hidden="true">${ICONS[data.state]}</span>
          <span class="mcell__text">${data.text}</span>`;
        cell.setAttribute(
          'aria-label',
          `${row.label} memory, ${column.label}: ${data.state === 'na' ? 'not applicable' : data.text}`,
        );
        cell.classList.remove('is-changed');
        // Force a reflow so the pulse animation can replay.
        void cell.offsetWidth;
        cell.classList.add('is-changed');
      }
    }
    note.textContent = scenario.note;
    status.textContent = `${scenario.label}: ${scenario.note}`;
  };

  root.append(
    h('div', { class: 'matrix-scenarios' }, [
      h('span', { class: 'matrix-scenarios__label', text: 'Situation' }),
      scenarioBar,
    ]),
    wrap,
    note,
    status,
    h('div', { class: 'widget__foot' }, [
      h('div', { class: 'legend' }, [
        legendItem('kept', 'Survives'),
        legendItem('cleared', 'Cleared or unavailable'),
        legendItem('private', 'Exists but not shared'),
        legendItem('stale', 'Survives, subject to expiry'),
        legendItem('na', 'Not applicable'),
      ]),
      h('span', { text: 'Expiry shown is the documented default for cloud facts.' }),
    ]),
  );

  paint();

  const noteHost = qs('.matrix-note', root);
  if (noteHost) noteHost.setAttribute('role', 'status');
}

function legendItem(kind: string, label: string): HTMLElement {
  return h('span', { class: 'legend__item' }, [
    h('span', { class: `legend__swatch legend__swatch--${kind}` }),
    h('span', { text: label }),
  ]);
}
