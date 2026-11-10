import { getSource, sourceIndex } from '../data/sources';
import { escapeHtml, h } from '../lib/dom';
import { prefersReducedMotion } from '../lib/motion';

interface Stage {
  label: string;
  title: string;
  tag: string;
  body: string;
  quote: string;
  sourceId: string;
}

const STAGES: Stage[] = [
  {
    label: 'Capture',
    title: 'Copilot decides something is worth keeping',
    tag: 'agent',
    body:
      'A durable fact about the codebase — a build command, a naming rule, an architectural decision — or a stated preference about how you like to work. It can be noticed in passing, or triggered when you explicitly ask Copilot to remember something.',
    quote: 'Copilot creates memories itself, as a byproduct of working with you.',
    sourceId: 'gh-copilot-memory',
  },
  {
    label: 'Store',
    title: 'The memory is written to one scope',
    tag: 'storage',
    body:
      'Scope is chosen by who the information applies to, not by who said it. True for everyone in the repository becomes a repository fact; true only for you becomes a user preference. Secrets and credentials are filtered out before anything is stored.',
    quote:
      'Memories are checked for secrets, such as tokens, keys, or credentials. Memories in which a secret is detected are rejected and are not stored.',
    sourceId: 'gh-copilot-memory',
  },
  {
    label: 'Recall',
    title: 'Relevant memories are pulled back in',
    tag: 'retrieval',
    body:
      'Relevant repository facts and user preferences are recalled when a session starts. Retrieval is selective: only a subset of stored memories reaches the model, and boosted memories are more likely to be among them. This is why a memory existing and a memory being used are different things.',
    quote:
      'Not all memories from the memory store are sent to a model with your prompt. Upvoted memories are more likely to be sent.',
    sourceId: 'gh-copilot-memory',
  },
  {
    label: 'Validate',
    title: 'Citations are checked against the current code',
    tag: 'verification',
    body:
      'Each repository fact carries citations pointing at the code that supports it. Before relying on one, Copilot checks those citations against the current branch to judge whether the fact is still accurate — a judgement, not a guarantee, which is why instructions exist for rules that must hold.',
    quote:
      "When Copilot finds a repository-level fact relevant to its current work, it checks the fact's citations against the current branch to judge whether the information is still accurate.",
    sourceId: 'gh-copilot-memory',
  },
  {
    label: 'Vote',
    title: 'Useful memories are reinforced, wrong ones fade',
    tag: 'feedback',
    body:
      'Copilot upvotes memories it can validate and downvotes ones that are wrong or outdated. Enough downvotes and a memory stops being used, then is deleted after a period of disuse. You can nudge this by correcting the memory, but the voting itself is automatic.',
    quote:
      'Memories that are downvoted past a threshold are no longer used and will be deleted after a period of disuse.',
    sourceId: 'gh-copilot-memory',
  },
  {
    label: 'Expire',
    title: 'Unused knowledge is retired',
    tag: 'decay',
    body:
      'Repository facts and user preferences expire after a default of 90 days without reinforcement, and an upvote resets that clock. Organizations and enterprises can configure 7–180 days for repository facts. Local memory files have no documented automatic expiry — they persist until updated or removed.',
    quote: 'The default expiry period is 90 days.',
    sourceId: 'gh-copilot-memory',
  },
];

const SVG_NS = 'http://www.w3.org/2000/svg';
const PATH_D = 'M 50 160 C 130 60 210 260 300 160 C 390 60 470 260 560 160 C 650 60 730 260 820 150';
const STAGE_MS = 1500;

export function mountLifecycle(root: HTMLElement): void {
  const stageHost = h('div', { class: 'lifecycle__stage' });
  stageHost.innerHTML = `
    <svg class="lifecycle__svg" viewBox="0 0 880 300" role="img"
      aria-label="A path with six stations: capture, store, recall, validate, vote, expire.">
      <defs>
        <linearGradient id="life-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#fbbf24" />
          <stop offset="55%" stop-color="#6ea8fe" />
          <stop offset="100%" stop-color="#f472b6" />
        </linearGradient>
      </defs>
      <path class="life-track" id="life-track" d="${PATH_D}" />
      <path class="life-progress" id="life-progress" d="${PATH_D}" />
      <g id="life-nodes"></g>
      <g class="life-token-group" id="life-token">
        <circle class="life-token-halo" r="13" />
        <circle class="life-token" r="5" />
      </g>
    </svg>`;

  const track = stageHost.querySelector<SVGPathElement>('#life-track');
  const progress = stageHost.querySelector<SVGPathElement>('#life-progress');
  const nodesHost = stageHost.querySelector<SVGGElement>('#life-nodes');
  const token = stageHost.querySelector<SVGGElement>('#life-token');

  if (!track || !progress || !nodesHost || !token) return;

  const total = track.getTotalLength();
  progress.style.strokeDasharray = `${total}`;
  progress.style.strokeDashoffset = `${total}`;

  const points = STAGES.map((_, index) => {
    const t = 0.045 + (0.91 * index) / (STAGES.length - 1);
    return track.getPointAtLength(total * t);
  });

  const nodeEls = STAGES.map((stage, index) => {
    const point = points[index]!;
    const group = document.createElementNS(SVG_NS, 'g');
    group.setAttribute('class', 'life-node');
    group.dataset.index = String(index);

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('r', '17');
    const number = document.createElementNS(SVG_NS, 'text');
    number.setAttribute('dy', '4');
    number.textContent = String(index + 1);

    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('class', 'life-label');
    label.setAttribute('x', String(point.x));
    label.setAttribute('y', String(point.y < 150 ? point.y - 32 : point.y + 42));
    label.textContent = stage.label;

    group.setAttribute('transform', `translate(${point.x} ${point.y})`);
    group.append(circle, number);
    nodesHost.append(group, label);
    return group;
  });

  const controls = h('div', { class: 'lifecycle__controls' });
  const prevButton = h('button', { class: 'btn btn--ghost', type: 'button', 'aria-label': 'Previous stage' }, [
    document.createTextNode('Prev'),
  ]) as HTMLButtonElement;
  const playButton = h('button', { class: 'btn btn--primary', type: 'button' }, [
    document.createTextNode('Play'),
  ]) as HTMLButtonElement;
  const nextButton = h('button', { class: 'btn btn--ghost', type: 'button' }, [
    document.createTextNode('Next'),
  ]) as HTMLButtonElement;

  const range = h('input', {
    type: 'range',
    min: '0',
    max: '500',
    step: '1',
    value: '0',
    'aria-label': 'Scrub through the memory lifecycle',
  }) as HTMLInputElement;

  const counter = h('span', {
    class: 'lifecycle__counter',
    'aria-live': 'polite',
    text: `Stage 1 of ${STAGES.length}`,
  });

  controls.append(prevButton, playButton, nextButton, range, counter);
  stageHost.append(controls);

  const detail = h('div', { class: 'lifecycle__detail' });

  let position = 0;
  let playing = false;
  let frame = 0;
  let lastTime = 0;
  let shownStage = -1;

  const currentStage = (): number => Math.min(STAGES.length - 1, Math.round(position));

  const paintDetail = (): void => {
    const index = currentStage();
    if (index === shownStage) return;
    shownStage = index;
    const stage = STAGES[index]!;
    detail.innerHTML = `
      <div class="lifecycle__detail-head">
        <h4>${index + 1}. ${escapeHtml(stage.title)}</h4>
        <span class="badge">${escapeHtml(stage.tag)}</span>
      </div>
      <p>${escapeHtml(stage.body)}</p>
      <blockquote class="lifecycle__quote">“${escapeHtml(stage.quote)}”
        <cite><a href="${getSource(stage.sourceId).url}" target="_blank" rel="noreferrer noopener">
          ${escapeHtml(getSource(stage.sourceId).title)}
        </a> · source ${sourceIndex(stage.sourceId)}</cite>
      </blockquote>`;
  };

  const paint = (): void => {
    const index = currentStage();
    nodeEls.forEach((node, nodeIndex) => {
      node.classList.toggle('is-active', nodeIndex === index);
      node.classList.toggle('is-done', nodeIndex < index);
    });

    const t = position / (STAGES.length - 1);
    const point = track.getPointAtLength(total * (0.045 + 0.91 * t));
    token.setAttribute('transform', `translate(${point.x} ${point.y})`);
    progress.style.strokeDashoffset = `${total * (1 - (0.045 + 0.91 * t))}`;

    range.value = String(Math.round(position * 100));
    counter.textContent = `Stage ${index + 1} of ${STAGES.length}`;
    paintDetail();
  };

  const stop = (): void => {
    playing = false;
    lastTime = 0;
    cancelAnimationFrame(frame);
    playButton.textContent = 'Play';
  };

  const tick = (time: number): void => {
    if (!playing) return;
    if (!lastTime) lastTime = time;
    const delta = time - lastTime;
    lastTime = time;
    position += delta / STAGE_MS;
    if (position >= STAGES.length - 1) {
      position = STAGES.length - 1;
      paint();
      stop();
      return;
    }
    paint();
    frame = requestAnimationFrame(tick);
  };

  const play = (): void => {
    if (position >= STAGES.length - 1) position = 0;
    playing = true;
    playButton.textContent = 'Pause';
    lastTime = 0;
    paint();
    if (prefersReducedMotion()) {
      position = Math.min(STAGES.length - 1, Math.floor(position) + 1);
      paint();
      stop();
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  playButton.addEventListener('click', () => {
    if (playing) {
      stop();
      return;
    }
    play();
  });

  prevButton.addEventListener('click', () => {
    stop();
    position = Math.max(0, Math.round(position) - 1);
    paint();
  });

  nextButton.addEventListener('click', () => {
    stop();
    position = Math.min(STAGES.length - 1, Math.round(position) + 1);
    paint();
  });

  range.addEventListener('input', () => {
    stop();
    position = Number(range.value) / 100;
    paint();
  });

  root.append(
    stageHost,
    detail,
    h('div', { class: 'widget__foot' }, [
      h('div', { class: 'legend' }, [
        h('span', { class: 'legend__item', text: 'Six stations, one memory' }),
        h('span', { class: 'legend__item', text: 'Cloud scope shown; local files differ' }),
      ]),
      h('span', { text: 'Drag the slider or use the buttons. Everything here is described in the official docs.' }),
    ]),
  );

  paint();
}
