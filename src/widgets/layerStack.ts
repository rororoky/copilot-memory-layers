import { getSource, sourceIndex } from '../data/sources';
import { escapeHtml, h } from '../lib/dom';

interface Layer {
  index: number;
  name: string;
  artifact: string;
  tone: string;
  lifetime: string;
  scope: string;
  visibility: string;
  entry: string;
  description: string;
  sourceId: string;
  /** True when the layer survives the end of a conversation. */
  persistent: boolean;
  tag: string;
}

const LAYERS: Layer[] = [
  {
    index: 0,
    name: 'Model weights',
    artifact: 'the language model',
    tone: 'var(--l0)',
    lifetime: 'Permanent — until you switch models',
    scope: 'Everyone using that model',
    visibility: 'Identical for all users',
    entry: 'Implicit: shapes every response',
    description:
      'Everything the model learned during training. It is not yours, cannot be edited, and is the same for everyone using that model. It is the floor the other layers stand on.',
    sourceId: 'vscode-agents',
    persistent: true,
    tag: 'fixed',
  },
  {
    index: 1,
    name: 'Working memory',
    artifact: 'conversation · tool results',
    tone: 'var(--l1)',
    lifetime: 'One conversation',
    scope: 'One session',
    visibility: 'You, in that session',
    entry: 'Always included, then trimmed',
    description:
      'The running transcript: your messages, the agent’s reasoning, and the results of every tool call. It is the only layer that is guaranteed to be in front of the model right now, and it is the first thing trimmed when the window fills.',
    sourceId: 'vscode-agents',
    persistent: false,
    tag: 'live',
  },
  {
    index: 2,
    name: 'Session memory',
    artifact: '/memories/session/',
    tone: 'var(--l2)',
    lifetime: 'Current conversation only',
    scope: 'One session',
    visibility: 'Not persisted, not shared',
    entry: 'Recalled during the task',
    description:
      'Scratch space for a multi-step task: an in-progress plan, intermediate findings, decisions you do not want to repeat. It disappears with the conversation, which is exactly the point.',
    sourceId: 'vscode-memory',
    persistent: false,
    tag: 'ephemeral',
  },
  {
    index: 3,
    name: 'Repository memory',
    artifact: '/memories/repo/ · repo facts',
    tone: 'var(--l3)',
    lifetime: 'Across conversations',
    scope: 'One workspace or repository',
    visibility: 'Local: you. Cloud: collaborators with repo access',
    entry: 'Recalled at session start',
    description:
      'Durable knowledge about a codebase: build commands, architecture decisions, naming conventions. Locally it stays on your machine. In the cloud it becomes shared repository-level facts with citations to the code.',
    sourceId: 'vscode-memory',
    persistent: true,
    tag: 'persistent',
  },
  {
    index: 4,
    name: 'User memory',
    artifact: '/memories/ · preferences',
    tone: 'var(--l4)',
    lifetime: 'Across workspaces',
    scope: 'Every workspace for one person',
    visibility: 'You — never other contributors',
    entry: 'First 200 lines preloaded',
    description:
      'How you personally like to work, independent of any project: response style, approval habits, commands you always want run. Local user memory loads its first 200 lines at the start of every session; cloud user preferences follow your GitHub account.',
    sourceId: 'vscode-memory',
    persistent: true,
    tag: 'personal',
  },
  {
    index: 5,
    name: 'Source-controlled knowledge',
    artifact: 'copilot-instructions.md · SKILL.md',
    tone: 'var(--l5)',
    lifetime: 'Versioned in Git',
    scope: 'Repository — or your user profile',
    visibility: 'Anyone with repository access',
    entry: 'Always-on, pattern-matched, or invoked',
    description:
      'Guidance humans write and review: project instructions, file-scoped instructions, skills, prompt files, custom agents. It is the only layer with a review process, and the only one the team can audit line by line.',
    sourceId: 'vscode-instructions',
    persistent: true,
    tag: 'reviewed',
  },
];

const DETAIL_FIELDS: Array<[keyof Layer, string]> = [
  ['lifetime', 'Lifetime'],
  ['scope', 'Scope'],
  ['visibility', 'Who sees it'],
  ['entry', 'Enters context'],
];

export function mountLayerStack(root: HTMLElement): void {
  const bandsHost = h('div', { class: 'layer-bands', role: 'tablist', 'aria-label': 'Memory layers' });
  const detail = h('div', { class: 'layer-detail', 'aria-live': 'polite' });
  const wrap = h('div', { class: 'layerstack' }, [bandsHost, detail]);

  const status = h('p', { class: 'widget__hint', 'aria-live': 'polite', text: 'Select a layer to inspect it.' });
  const toggle = h('input', { type: 'checkbox', id: 'layer-context-toggle' });
  const toggleRow = h('label', { class: 'legend__item', for: 'layer-context-toggle' }, [
    h('span', { class: 'switch' }, [toggle, h('span', { class: 'switch__track' })]),
    h('span', { text: 'Highlight the layers that outlive this conversation' }),
  ]);

  const buttons: HTMLButtonElement[] = LAYERS.map((layer) => {
    const button = h(
      'button',
      {
        class: 'layer-band',
        type: 'button',
        role: 'tab',
        'aria-selected': 'false',
        'aria-controls': 'layer-detail-panel',
        'data-in-context': String(layer.persistent),
        tabindex: '-1',
      },
      [
        h('span', { class: 'layer-band__num', text: String(layer.index) }),
        h('span', {}, [
          h('span', { class: 'layer-band__name', text: layer.name }),
          h('span', { class: 'layer-band__artifact', text: layer.artifact }),
        ]),
        h('span', { class: 'badge layer-band__tag', text: layer.tag }),
      ],
    ) as HTMLButtonElement;
    button.style.setProperty('--tone', layer.tone);
    button.addEventListener('click', () => select(layer.index));
    button.addEventListener('keydown', (event) => {
      let target = -1;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') target = (layer.index + 1) % LAYERS.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft')
        target = (layer.index - 1 + LAYERS.length) % LAYERS.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = LAYERS.length - 1;
      if (target === -1) return;
      event.preventDefault();
      select(target, true);
    });
    bandsHost.append(button);
    return button;
  });

  detail.id = 'layer-detail-panel';
  detail.setAttribute('role', 'tabpanel');

  const select = (index: number, focus = false): void => {
    const layer = LAYERS[index]!;
    buttons.forEach((button, buttonIndex) => {
      const isSelected = buttonIndex === index;
      button.setAttribute('aria-selected', String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
    });
    if (focus) buttons[index]?.focus();

    detail.style.setProperty('--tone', layer.tone);
    detail.innerHTML = `
      <p class="layer-detail__kicker"><span class="layer-dot"></span>Layer ${layer.index} · ${escapeHtml(layer.tag)}</p>
      <h4 class="layer-detail__title">${escapeHtml(layer.name)}</h4>
      <p class="layer-detail__desc">${escapeHtml(layer.description)}</p>
      <dl class="detail-grid">
        ${DETAIL_FIELDS.map(
          ([key, label]) =>
            `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(String(layer[key]))}</dd>`,
        ).join('')}
        <dt>Stored in</dt><dd><code>${escapeHtml(layer.artifact)}</code></dd>
      </dl>
      <p class="layer-detail__source">
        <a href="${getSource(layer.sourceId).url}" target="_blank" rel="noreferrer noopener">
          Official description
        </a>
        <a class="cite" href="#src-${layer.sourceId}" aria-label="Source ${sourceIndex(layer.sourceId)}">${sourceIndex(layer.sourceId)}</a>
      </p>`;
    status.textContent = `${layer.name}: ${layer.lifetime.toLowerCase()}.`;
  };

  toggle.addEventListener('change', () => {
    wrap.dataset.context = toggle.checked ? 'on' : 'off';
    status.textContent = toggle.checked
      ? 'Highlighting layers that survive the end of this conversation.'
      : 'Selection mode: inspect any layer.';
  });

  wrap.dataset.context = 'off';

  const footer = h('div', { class: 'widget__foot' }, [
    h('div', { class: 'legend' }, [toggleRow]),
    h('span', { text: 'Layers 0, 3, 4 and 5 persist; 1 and 2 end with the conversation.' }),
  ]);

  root.append(wrap, status, footer);
  select(3);
}
