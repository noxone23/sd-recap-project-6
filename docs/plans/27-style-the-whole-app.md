# Plan: Issue #27 – Style the Whole App with CSS

## Context
The app has only a basic style in `src/styles.css` (138 lines): a fixed bottom nav, a card grid, the favorite button, palette and comments. Many parts have no style at all: headings, the status messages, the Back link, the form controls, every hover and focus state, and any responsive rule. Issue 27 asks for one consistent, accessible, responsive design for all pages. Behavior and components stay as they are.

## Approach
CSS only, in `src/styles.css`. No component, test or `App.tsx` change. Design direction comes from the `frontend-design` plugin: a gallery feel (calm, lots of space, art in the center), not a generic template.

1. **Design basics:** CSS variables on `:root` for colors, fonts, spacing, radius, shadow, transition. Check text contrast (WCAG AA).
2. **Base:** body, `h1` to `h3`, links, `main` layout, `:focus-visible` outline for all interactive elements, `prefers-reduced-motion`.
3. **Navigation:** the fixed bottom nav as a styled bar; style the NavLink `.active` class (and `[aria-current="page"]`), hover and focus.
4. **Spotlight:** large image, artist text, favorite button.
5. **Gallery and Favorites:** card grid with hover, card link, title and artist, favorite button in both states.
6. **Details:** Back link, image, title and info (`.details > p`), palette, comments (`section` has no class, so use `.details section`), comment form (label, input, button).
7. **Messages:** Loading, error, "No favorites yet", "Page not found", "Art piece not found". They are bare `<p>` in `main`, so style them with `main > p`.
8. **Responsive:** phone to wide screen, no horizontal scroll (`min-width: 0`, `max-width: 100%`, fluid grid), safe-area padding for the nav.

## Constraints found in the code
- Keep the class names (`art-list`, `art-piece`, `spotlight`, `details`, `palette`, `comments`, `comment-form`, `favorite-button`).
- `Navigation.test.tsx` needs the `active` class from `NavLink`: style it, don't rename it.
- `ColorPalette` and `App` tests check the inline `background-color` of the palette items: no `!important`, no override of `background-color` in CSS.
- `App.test.tsx` uses the `<time>` element and tests use roles and labels: no `display: none` tricks.

## Tests (per acceptance criterion)
CSS cannot be checked by the jsdom unit tests, so I do not add tests (adding a test that only reads CSS would be a fake check). Coverage per criterion:
| Criterion | How it is checked |
|---|---|
| Same style on all pages, nav, spotlight, cards, details, messages | Manual check in the browser on every page (`npm run dev`) |
| Hover/focus states, keyboard use | Manual: Tab through every page |
| Contrast | Browser dev tools contrast check of text and background pairs |
| Phone and wide screen, no horizontal scroll | Manual: narrow (about 375 px) and wide (about 1440 px) window on every page |
| No component, test or behavior changes | `git diff` touches only `src/styles.css` (and the plan); all existing tests still pass |
| All checks pass | `check`, `lint`, `format:check`, `test:run`, `build` |

## Files
- Modify: `src/styles.css`
- Create: `docs/plans/27-style-the-whole-app.md` (this plan)

## Out of scope
- Component, test, routing or markup changes (no new classes or wrappers; if one is needed I ask first).
- Dark mode (own idea in `.github/templates/ideas/dark-mode.md`).
- New features, new text or new icons.
- Changes to `vite.config.ts`, CI or the issue templates.

## Open questions
1. **Look:** which direction? Recommended: a light, warm "gallery" look (off-white paper, dark ink, one accent color; the current pink favorite color can stay as the accent). Alternatives: dark museum look, or bold and colorful.
2. **Fonts:** only system fonts (no new request, recommended, a serif for headings via the system stack) or a Google Font? A web font needs a `<link>` in `index.html`, which is outside `styles.css`.
3. **Navigation position:** keep the fixed bottom bar (recommended, it is the current design and works on phones) or move it to the top?
4. **Browser check:** may I start the dev server and look at the pages with the browser tool (screenshots at narrow and wide size)? Without it I can only check the CSS by reading it.

## Verification
`npm run check`, `lint`, `format:check`, `test:run`, `build` green; manual check of Spotlight, Gallery, Favorites (empty and filled), Details, "Page not found" and the loading/error messages at narrow and wide size, with keyboard only once.
