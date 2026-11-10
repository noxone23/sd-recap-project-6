# Plan: Issue 19 – Mouse Particle Trail (GitHub #37)

## Context
Small colorful particles follow the mouse pointer and fade out. It is a decoration for the glass design and must never get in the way of reading or using the page. It is drawn on one fixed, click-through canvas over the whole page (above the header, below the "back to top" button). Decided with you: the particles are above the whole page.

## Design
- **No random numbers.** The lint rule `sonarjs/pseudo-random` (in the recommended set of this project) forbids `Math.random`, and the project uses `crypto.getRandomValues` only for the spotlight. The particles do not need randomness: the color cycles through a palette, and the direction and the speed come from the running number of the particle (golden angle, `index % 5`). This also makes the logic fully testable, because the same input always gives the same particle.
- **`src/particles.ts`** (new, pure functions, no DOM):
  - `type Particle = { x, y, vx, vy, age, life, size, color }`; constants `MAX_PARTICLES = 80`, `PARTICLE_LIFE = 900` (ms), `PALETTE` (four saturated colors from the header blobs: blue, teal, purple, pink).
  - `createParticle(x, y, index)`: the color is `PALETTE[index % 4]`, the direction is `index * 2.399963` rad (golden angle), the speed `0.02 + (index % 5) * 0.008` px per ms, the size `3 + (index % 4)` px, `age: 0`.
  - `addParticle(particles, particle)`: returns a new list; when there are already `MAX_PARTICLES`, the oldest is dropped.
  - `stepParticles(particles, dt)`: returns a new list; every particle ages by `dt` and moves by `v * dt`; particles with `age >= life` are removed. The input is not changed.
  - `particleAlpha(particle)`: 0.7 at the start, 0 at the end, falling smoothly (`0.7 * (1 - age / life) ** 2`).
- **`src/components/MouseTrail.tsx`** (new, no props):
  - A check at the start, once: the effect is wanted only when `window.matchMedia?.("(hover: hover) and (pointer: fine)").matches` is true and `window.matchMedia("(prefers-reduced-motion: reduce)").matches` is false. When it is not wanted (also when `matchMedia` does not exist, as in jsdom), the component renders `null`: no canvas and no listener.
  - Otherwise it renders `<canvas className="mouse-trail" aria-hidden="true" />`. An effect sets the size to `innerWidth × innerHeight × devicePixelRatio` (and again on `resize`), and adds `pointermove` and `visibilitychange` listeners to `window` and `document`. `getContext("2d")` may return `null`: then nothing is drawn.
  - On `pointermove`: a particle is added at `clientX` and `clientY` only when the pointer moved at least 8 px since the last particle (so a fast move does not flood the list); the running number is a counter in a ref. The loop with `requestAnimationFrame` starts when it is not running.
  - The loop: steps the particles with the time between two frames, clears the canvas, draws every particle as a filled circle (`globalAlpha` from `particleAlpha`), and requests the next frame only while particles exist. When the list is empty the loop stops and the canvas is cleared.
  - When the tab becomes hidden, the loop is cancelled and the particles are removed. On cleanup, all listeners are removed and the frame is cancelled.
- **`src/App.tsx`**: `<MouseTrail />` once in the fragment, after `<BackToTop />`; one import. No other change.
- **`src/styles.css`**: `.mouse-trail { position: fixed; inset: 0; z-index: 15; width: 100%; height: 100%; pointer-events: none; }` (header 10, "back to top" 20). The colors are drawn by script, so the same four colors work on both themes (checked in the screenshots).

## Tests (per acceptance criterion)
Written first, one at a time, each seen failing for the right reason. In the tests of the component, `matchMedia` is stubbed with a function that answers by the query text, `getContext` returns a small fake context (`vi.fn` for `clearRect`, `beginPath`, `arc`, `fill`, `setTransform`), and `requestAnimationFrame` and `cancelAnimationFrame` are replaced by a queue that the test steps by hand with a time.

| Acceptance criterion | Test |
|---|---|
| Particles appear at the pointer and fade out within about one second | `particles.test.ts`: `createParticle` puts the particle at the pointer; `stepParticles` moves and ages it; it is gone after `PARTICLE_LIFE`; `particleAlpha` is 0.7 at the start, 0 at the end and falls steadily. `MouseTrail.test.tsx`: a `pointermove` at (100, 100) makes the next frame draw a circle at (100, 100); after 900 ms nothing is drawn any more |
| Small, semi-transparent, both themes | `particles.test.ts`: the size is between 3 and 6 px and the alpha is at most 0.7; screenshots of both themes in Chrome |
| Nothing for reduced motion and without a mouse | `MouseTrail.test.tsx`: no canvas and no `pointermove` listener when `matchMedia` is missing, when reduced motion is asked, and when there is no hover and fine pointer |
| Blocks nothing, hidden from screen readers | `MouseTrail.test.tsx`: the canvas has `aria-hidden="true"`, is not in the accessibility tree and is not focusable; `pointer-events: none` is the CSS (checked in Chrome: a click on a link below the canvas works) |
| Stays smooth: limited, loop only while needed, pauses when hidden | `particles.test.ts`: `addParticle` keeps at most 80 and drops the oldest; `MouseTrail.test.tsx`: two moves of less than 8 px make one particle; after the last particle is gone no new frame is requested; a hidden tab cancels the frame and removes the particles |
| All pages, scrolling, resize | `App.test.tsx`: with the effect wanted, `App` has exactly one canvas on `/`, `/art-pieces`, `/favorites`, a details page and an unknown path; `MouseTrail.test.tsx`: a `resize` sets the canvas size again (`innerWidth × devicePixelRatio`); scrolling does not matter because the canvas is fixed and uses `clientX` and `clientY` |
| Cleanup | `MouseTrail.test.tsx`: after the unmount the same handlers are removed from `window` and `document`, and the frame is cancelled |
| Only affected tests change, checks pass | No existing test is expected to change: in jsdom there is no `matchMedia`, so `MouseTrail` renders nothing; `check`, `lint`, `format:check`, `test:run`, `build` |

Also covered: `getContext` returning `null` does not throw (jsdom has no canvas).

## Files
- Create: `src/particles.ts`, `src/particles.test.ts`, `src/components/MouseTrail.tsx`, `src/components/MouseTrail.test.tsx`, `docs/plans/19-mouse-particle-trail.md` (this plan)
- Modify: `src/App.tsx` (one import and one element), `src/App.test.tsx` (new tests only), `src/styles.css` (one rule)
- Not changed: `index.html`, the header, `BackToTop`, the theme code

## Out of scope
- Reacting to a change of the system settings while the page is open (the check is made once at the start).
- A trail for touch or pen, settings for the number, color or lifetime, a trail for keyboard focus, WebGL or glow effects.
- Changes to existing tests, the header or other components.

## Risks and checks
- **Speed:** up to 80 small circles per frame is cheap, but it is checked in Chrome (frames while moving fast, and that the loop stops when the mouse rests).
- **`PointerEvent` in jsdom:** jsdom may not have `PointerEvent`; the tests dispatch a plain event with `clientX` and `clientY`, and the handler only reads those two values.
- **Lint rules of Sonar:** no `Math.random`, no unawaited calls, small functions; the effect is split into small helpers so the cognitive complexity stays low.
- **Drawing is not testable in jsdom:** only what is drawn is checked with the fake context; how it looks is checked in screenshots.

## Open questions
None. Decided: the particles are above the whole page, the colors come from the header blobs, the limits are 80 particles and about 0.9 s.

## Verification
`npm run check`, `lint`, `format:check`, `test:run`, `build` green; `npm run coverage` covers the new files; in Chrome (script with real mouse moves): the trail appears and fades out, it stops when the mouse rests, nothing with reduced motion, clicks, scrolling and typing work as before, a hidden tab pauses it, screenshots in the light and the dark theme on a wide window.
