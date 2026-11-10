# Plan: Issue 15 – Style the Whole App with CSS (GitHub #27)

## Context
The app had only a basic style in `src/styles.css`. Issue 15 asks for one consistent, accessible, responsive design for all pages. The plan was changed twice after the first approval:
1. The search (issue 14) is merged, so the Gallery search field is styled too.
2. The menu moved to the top (title "Art Gallery" on the left, navigation on the right), which needs one small structure change in `App.tsx` (approved).

This version describes what was built.

## Layout
```
┌─────────────────────────────────────────────────┐
│ Art Gallery            Spotlight  Gallery  Favorites │  glass header, sticky at the top
├─────────────────────────────────────────────────┤
│ Search [ Search by title or artist ............]│  wide bar, only on the Gallery page
│  [image] [image] [image]                        │
└─────────────────────────────────────────────────┘
```
- On a phone the header has two rows: title, then the navigation.
- The search stays part of the Gallery page. A search in the header would need the search text in `App` and changes to `Gallery` and its tests: separate issue.

## What was built
CSS in `src/styles.css`, one small structure change in `App.tsx` and a placeholder in `SearchField`.

1. **`App.tsx` (structure only):** `<main><h1>…</h1>{content}</main><Navigation />` became `<header><h1>Art Gallery</h1><Navigation /></header><main>{content}</main>`. No new classes, no new text, no logic change.
2. **Glass style:** a soft light gradient on the page background; header, cards, spotlight, details, inputs and the favorite button are translucent with `backdrop-filter`, a white edge and a soft shadow. Without `backdrop-filter` they fall back to white. Colors, radii, shadows and the transition are CSS variables on `:root` (ready for the dark mode issue). System fonts, serif for titles.
3. **Header and navigation:** sticky glass bar; the links are pills, the active one is a lighter pill (`.active`). Two soft color blobs drift under the header and change their shape slowly (CSS only).
4. **Search:** the existing label and input as a wide bar; placeholder "Search by title or artist"; the label stays visible. The focus state of text inputs is a dark border instead of the blue ring.
5. **Spotlight, gallery cards, Favorites list:** framed, rounded images. Cards lift on hover and the image zooms inside its frame (only with a mouse and without "reduce motion"). The favorite button has a pressed state: red, 1.2 times bigger.
6. **Details:** the Back link is a glass pill with an arrow (`::before`, empty alt text), the image, title and info, the color palette, comments as small glass bubbles, the comment form.
7. **Messages:** Loading, error, "No favorites yet.", "No art pieces found", "Page not found" and "Art piece not found" are bare `<p>` in `main`. They are centered, large and have an empty picture frame above them (`main > p::before`).
8. **Motion:** the cards, the spotlight and the details card rise in on every page (0.6 s, the gallery cards a little staggered). Smooth scrolling. All motion is off with `prefers-reduced-motion`.
9. **Base:** `:focus-visible` ring, text selection color, thin scrollbar that is always shown (no layout jump between short and long pages), responsive from phone to wide screen.

## Constraints that were kept
- The class names stayed (`art-list`, `art-piece`, `spotlight`, `details`, `palette`, `comments`, `comment-form`, `favorite-button`).
- `Navigation.test.tsx` needs the `active` class from `NavLink`: it is styled, not renamed.
- The palette tests check the inline `background-color`: no `!important` or override for it.
- No existing test was changed. One new test was added for the placeholder in `SearchField.test.tsx`.

## Tests (per acceptance criterion)
CSS cannot be checked by the jsdom tests, so no test that only reads CSS was added. The structure change is covered by the existing tests (heading, one navigation, navigation while loading and on error).
| Criterion | How it was checked |
|---|---|
| Same style on all pages, header, spotlight, cards, details, messages, search field | Screenshots in Chrome of Spotlight, Gallery, Details, Favorites (empty and with entries), error page, "Page not found" and "Art piece not found" |
| Navigation styled, current page highlighted | Existing `Navigation.test.tsx` (active class) plus screenshots |
| Hover/focus states, keyboard use | Chrome driven by script: 12 Tab stops through the Gallery, each with a visible focus; the hover zoom and the pressed heart were measured |
| Contrast | Computed for the text, heart, focus ring and input border pairs at the darkest parts of the gradient (text 5.3 or more, borders 3.2 or more) |
| Phone and wide screen, no horizontal scroll | Widths 360, 390, 500, 768 and 1280 or 1440 px: no horizontal overflow measured |
| Only the structure in `App.tsx` changes (plus the placeholder), behavior unchanged | `git diff`; all existing tests pass unchanged |
| All checks pass | `check`, `lint`, `format:check`, `test:run`, `build` |

Not checked: a screen reader, Safari and Firefox, and the look of the Windows scrollbar by me (the author checked it by hand).

## Files
- Modify: `src/styles.css`, `src/App.tsx` (the final `return` only), `src/components/SearchField.tsx` and `src/components/SearchField.test.tsx` (placeholder)
- Modify: `docs/plans/15-style-the-whole-app.md` (this plan)

## Out of scope
- Other component, test, routing or text changes. No new classes or wrappers.
- Search in the header or on every page (own issue).
- Dark mode (board issue 16).
- Particles that follow the mouse and a "back to top" button: both need JavaScript and are own issues.
- A web font, new icons, changes to `vite.config.ts` or CI.

## Verification
`npm run check`, `lint`, `format:check`, `test:run`, `build` green.
