---
applyTo: 'src/widgets/**/*.ts'
---

# Widget rules

Each widget is a `mountX(root: HTMLElement): void` function. It owns its DOM and its state, and it
must not reach outside `root`.

- Build DOM with the helpers in `src/lib/dom.ts`; avoid `innerHTML` for anything derived from user
  input. Static copy from `src/data/` is fine.
- Every state change that a sighted user sees must also be announced: keep a polite live region in
  sync, or set `aria-live` on the element that changes.
- Controls are real `<button>`, `<input>`, and `<label>` elements. No clickable `<div>`.
- Respect `prefers-reduced-motion`; import `prefersReducedMotion` from `src/lib/motion.ts`.
- Never introduce a build dependency. If a diagram needs geometry, compute it with the DOM or SVG
  APIs.
