import { h, formatNumber } from '../lib/dom';

interface ContextSource {
  id: string;
  name: string;
  kind: string;
  tokens: number;
  tone: string;
  on: boolean;
  /** Sources never dropped, regardless of pressure. */
  fixed?: boolean;
}

const CAPACITY = 9000;

const SOURCES: ContextSource[] = [
  {
    id: 'instructions',
    name: 'Project instructions',
    kind: 'always-on',
    tokens: 1200,
    tone: 'var(--l5)',
    on: true,
    fixed: true,
  },
  {
    id: 'matched',
    name: 'Matched instructions',
    kind: 'applyTo pattern',
    tokens: 600,
    tone: 'var(--l5)',
    on: false,
  },
  {
    id: 'skill',
    name: 'Invoked skill',
    kind: 'loaded on demand',
    tokens: 900,
    tone: 'var(--l0)',
    on: false,
  },
  {
    id: 'repo',
    name: 'Repository memory',
    kind: 'retrieved facts',
    tokens: 1500,
    tone: 'var(--l3)',
    on: false,
  },
  {
    id: 'user',
    name: 'User memory',
    kind: 'preloaded head',
    tokens: 400,
    tone: 'var(--l4)',
    on: true,
  },
  {
    id: 'conversation',
    name: 'Conversation + tools',
    kind: 'this session',
    tokens: 6000,
    tone: 'var(--l1)',
    on: true,
    fixed: true,
  },
];

/** Dropped first when the window is over capacity. */
const EVICTION_ORDER = ['user', 'repo', 'matched', 'skill', 'conversation', 'instructions'];

export function mountContextFlow(root: HTMLElement): void {
  const sourcesHost = h('div', { class: 'ctx-sources' });
  const pipesHost = h('div', { class: 'ctx-pipes', 'aria-hidden': 'true' });

  const stack = h('div', { class: 'ctx-window__stack' });
  const meterFill = h('div', { class: 'ctx-meter__fill' });
  const meter = h('div', { class: 'ctx-meter' }, [meterFill]);
  const meterRow = h('div', { class: 'ctx-window__meter' }, [meter]);
  const footUsed = h('span', { text: '' });
  const footDropped = h('span', { text: '' });
  const foot = h('div', { class: 'ctx-window__foot' }, [footUsed, footDropped]);

  const windowEl = h('div', { class: 'ctx-window' }, [
    h('div', { class: 'ctx-window__head' }, [
      h('span', { text: 'Context window' }),
      h('span', { class: 'badge', text: `${formatNumber(CAPACITY)} tokens` }),
    ]),
    stack,
    meterRow,
    foot,
  ]);

  const inputs = new Map<string, HTMLInputElement>();
  const segments = new Map<string, HTMLDivElement>();
  const pipeRows = new Map<string, HTMLDivElement>();
  const sourceRows = new Map<string, HTMLLabelElement>();

  for (const source of SOURCES) {
    const input = h('input', {
      type: 'checkbox',
      checked: source.on ? 'checked' : undefined,
      'aria-label': `Include ${source.name}`,
    }) as HTMLInputElement;
    input.checked = source.on;
    inputs.set(source.id, input);

    const row = h('label', { class: 'ctx-source' }, [
      h('span', { class: 'switch' }, [input, h('span', { class: 'switch__track' })]),
      h('span', {}, [
        h('span', { class: 'ctx-source__label', text: source.name }),
        h('span', { class: 'ctx-source__kind', text: source.fixed ? `${source.kind} · pinned` : source.kind }),
      ]),
      h('span', { class: 'ctx-source__tokens', text: `${formatNumber(source.tokens)}` }),
    ]) as HTMLLabelElement;
    row.style.setProperty('--tone', source.tone);
    sourcesHost.append(row);
    sourceRows.set(source.id, row);

    const pipe = h('div', { class: 'pipe' }, [h('span', { class: 'pipe__line' })]);
    pipe.style.setProperty('--tone', source.tone);
    pipesHost.append(pipe);
    pipeRows.set(source.id, pipe);

    const seg = h('div', { class: 'ctx-seg' }, [
      h('span', { class: 'ctx-seg__name', text: source.name }),
      h('span', { class: 'ctx-seg__tokens', text: `${formatNumber(source.tokens)}` }),
    ]);
    seg.style.setProperty('--tone', source.tone);
    stack.append(seg);
    segments.set(source.id, seg);

    input.addEventListener('change', () => {
      source.on = input.checked;
      paint();
    });
  }

  const status = h('p', { class: 'widget__hint', role: 'status', 'aria-live': 'polite' });

  const paint = (): void => {
    const active = SOURCES.filter((source) => source.on);
    let used = active.reduce((sum, source) => sum + source.tokens, 0);

    const evicted: string[] = [];
    for (const id of EVICTION_ORDER) {
      if (used <= CAPACITY) break;
      const source = SOURCES.find((item) => item.id === id);
      if (!source || !source.on || source.fixed) continue;
      used -= source.tokens;
      evicted.push(source.name);
    }

    for (const source of SOURCES) {
      const isEvicted = evicted.includes(source.name);
      const seg = segments.get(source.id);
      if (seg) {
        seg.classList.toggle('is-out', !source.on);
        seg.classList.toggle('is-evicted', source.on && isEvicted);
        const tokens = seg.querySelector<HTMLElement>('.ctx-seg__tokens');
        if (tokens) tokens.textContent = isEvicted ? 'dropped' : formatNumber(source.tokens);
      }

      const pipe = pipeRows.get(source.id);
      if (pipe) {
        pipe.classList.toggle('is-on', source.on && !isEvicted);
        pipe.classList.toggle('is-off', !source.on || isEvicted);
      }

      const row = sourceRows.get(source.id);
      if (row) row.classList.toggle('is-on', source.on);
    }

    const ratio = Math.min(used / CAPACITY, 1);
    meterFill.style.width = `${Math.round(ratio * 1000) / 10}%`;
    meter.classList.toggle('is-over', used > CAPACITY);
    foot.classList.toggle('is-over', evicted.length > 0);
    footUsed.textContent = `${formatNumber(used)} / ${formatNumber(CAPACITY)} tokens`;
    footDropped.textContent = evicted.length > 0 ? `dropped: ${evicted.join(', ')}` : 'nothing dropped';

    status.textContent =
      evicted.length > 0
        ? `Over capacity. Dropped ${evicted.join(', ')} to fit the window.`
        : `${formatNumber(used)} of ${formatNumber(CAPACITY)} tokens in use.`;
  };

  const tail = h('div', { class: 'ctx-tail' }, [
    h('span', { class: 'ctx-tail__node', text: 'Assembled context' }),
    h('span', { class: 'ctx-tail__arrow', text: '→' }),
    h('span', { class: 'ctx-tail__node ctx-tail__node--model', text: 'Model' }),
    h('span', { class: 'ctx-tail__arrow', text: '→' }),
    h('span', { class: 'ctx-tail__node', text: 'Response + tool calls' }),
    h('span', { class: 'ctx-tail__arrow', text: '→' }),
    h('span', { class: 'ctx-tail__node ctx-tail__node--write', text: 'Proposed memory write' }),
    h('span', { text: 'Memory is never a one-way feed: the loop writes back.' }),
  ]);

  root.append(
    h('div', { class: 'ctxflow' }, [sourcesHost, pipesHost, windowEl]),
    tail,
    status,
    h('div', { class: 'widget__foot' }, [
      h('div', { class: 'legend' }, [
        h('span', { class: 'legend__item', text: 'Toggle a source to see it enter or leave the window' }),
        h('span', { class: 'legend__item', text: 'Pinned sources are never evicted' }),
      ]),
      h('span', { text: 'Token counts are illustrative, not measurements of a real request.' }),
    ]),
  );

  paint();
}
