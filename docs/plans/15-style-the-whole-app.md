# Plan: Issue 15 – Style the Whole App with CSS (GitHub #27), updated

## Context
The app has only a basic style in `src/styles.css`. Issue 15 asks for one consistent, accessible, responsive design for all pages. After the first plan was approved, two things changed:
1. The search (issue 14) is merged, so the Gallery has a search field that must be styled too (`main` was merged into this branch).
2. You want the menu at the top like on Singulart: "Art Gallery" where the logo is, the navigation in the top bar, and the search as a wide bar on the Gallery page. This needs one small structure change in `App.tsx` (approved).

## Layout
```
┌─────────────────────────────────────────────────┐
│ Art Gallery            Spotlight  Gallery  Favorites │  header, fixed at the top
├─────────────────────────────────────────────────┤
│ 🔍 Search ......................................│  wide bar, only on the Gallery page
│  [image] [image] [image]                        │
└─────────────────────────────────────────────────┘
```
- On a phone the header has two rows: title, then the navigation.
- The search stays part of the Gallery page (it is not in the header). A search in the header next to the title, above the navigation, would need the search text in `App` and changes to `Gallery` and its tests. That is a separate issue, not part of this one.

## Approach
CSS in `src/styles.css` plus one small structure change in `App.tsx`.

1. **`App.tsx` (structure only):** replace
   `<main><h1>Art Gallery</h1>{content}</main><Navigation />` with
   `<header><h1>Art Gallery</h1><Navigation /></header><main>{content}</main>`.
   No new classes, no new text, no logic change. The `Navigation` component is not changed.
2. **Design basics:** CSS variables on `:root` for colors, fonts, spacing, radius, transition. A calm "gallery wall" look (cool light-gray wall, dark ink, white mats around the art, one accent color for the favorite). System fonts only, serif for titles. Text contrast at least WCAG AA.
3. **Header:** white bar with a thin line below it, sticky at the top. The title is the brand on the left (it is an `h1`, so it stays a heading). The navigation on the right; the active link is highlighted (`.active` and `[aria-current="page"]`), plus hover and focus.
4. **Search:** the existing label and input (`#search`) styled as a wide bar under the header, with a visible focus state. The label stays for screen readers (visually hidden, not removed).
5. **Spotlight, gallery cards, Favorites list:** large framed image, text like a museum wall label, hover on the cards, the favorite button in both states.
6. **Details:** Back link, image, title and info, color palette, comments, comment form (label, input, button).
7. **Messages:** Loading, error, "No favorites yet.", "No art pieces found", "Page not found", "Art piece not found". They are bare `<p>` in `main`, so they are styled with `main > p`.
8. **Responsive and base:** phone to wide screen, no horizontal scroll, `:focus-visible`, `prefers-reduced-motion`. The bottom padding for the old fixed bottom nav is removed.

## Constraints found in the code
- Keep the class names (`art-list`, `art-piece`, `spotlight`, `details`, `palette`, `comments`, `comment-form`, `favorite-button`).
- `Navigation.test.tsx` needs the `active` class from `NavLink`: style it, do not rename it.
- The palette tests check the inline `background-color`: no `!important` or override for it.
- `App.test.tsx` looks for the heading "Art Gallery" and exactly one `navigation` role; both stay true after the move. No existing test may be changed. If one breaks because of the structure change, I stop and ask.

## Tests (per acceptance criterion)
CSS cannot be checked by the jsdom tests, so no test that only reads CSS is added. The structure change is covered by the existing tests (heading, one navigation, navigation while loading and on error).
| Criterion | How it is checked |
|---|---|
| Same style on all pages, header, spotlight, cards, details, messages, search field | Manual check in the browser (`npm run dev`) on every page |
| Navigation styled, current page highlighted | Existing `Navigation.test.tsx` (active class) plus manual check |
| Hover/focus states, keyboard use | Manual: Tab through every page |
| Contrast | Browser dev tools contrast check |
| Phone and wide screen, no horizontal scroll | Manual: about 375 px and about 1440 px on every page |
| Only the structure in `App.tsx` changes, behavior unchanged | `git diff` touches only `src/styles.css`, `App.tsx` (header/main) and the plan; all existing tests pass unchanged |
| All checks pass | `check`, `lint`, `format:check`, `test:run`, `build` |

## Files
- Modify: `src/styles.css`, `src/App.tsx` (the final `return` only)
- Modify: `docs/plans/15-style-the-whole-app.md` (this plan)
- GitHub: update the issue text of #27: the criterion "No component, test or behavior changes" becomes "Only the page structure in `App.tsx` changes (header and navigation); behavior and tests stay the same", and the hint about the class names stays.

## Out of scope
- Component, test, routing or text changes. No new classes or wrappers.
- Search in the header or on every page (own issue).
- Dark mode (board issue 16).
- New features, new icons, a web font (system fonts only), changes to `vite.config.ts` or CI.

## Open questions
None open; the earlier ones were decided: light gallery look, system fonts, navigation at the top (changed from the bottom), browser check allowed.

## Verification
`npm run check`, `lint`, `format:check`, `test:run`, `build` green; manual check of Spotlight, Gallery (with search, with no match), Favorites (empty and filled), Details, "Page not found" and the loading/error messages at narrow and wide size, and once with the keyboard only.
