# Plan for issue 6: App Navigation Design

Issue: https://github.com/noxone23/sd-recap-project-6/issues/6

## Current state

- `App` has the routes `/` (Spotlight) and `/art-pieces` (Gallery), but no navigation and no page for unknown URLs.
- While loading and on an error, `App` returns early with only `<main>Loading...</main>` or the error message.
- `src/styles.css` already has styles for `nav` (fixed at the bottom) and `nav a.active` (white, underlined). `main` has 5rem padding at the bottom for it. No new styles are needed.
- `NavLink` sets the class `active` on the link of the current page, like the hint says.

## Tests

Tests use Vitest and React Testing Library, clicks use `@testing-library/user-event`. The tests are written first.

| Acceptance criterion                           | Test                                                                                                                                      |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A link "Spotlight" is displayed                | `Navigation.test.tsx`: a link named "Spotlight" with `href="/"`.                                                                          |
| A link "Gallery" is displayed                  | `Navigation.test.tsx`: a link named "Gallery" with `href="/art-pieces"`.                                                                  |
| Clicking "Spotlight" shows the Spotlight page  | `App.test.tsx`: start at `/art-pieces`, click "Spotlight", the spotlight is shown (one `img`, not the whole list).                        |
| Clicking "Gallery" shows the Gallery page      | `App.test.tsx`: start at `/`, click "Gallery", the list with all art pieces is shown.                                                     |
| The link of the current page is highlighted    | `Navigation.test.tsx`: at `/` only "Spotlight" has the class `active`, at `/art-pieces` only "Gallery". This also covers `end` for `/`.   |
| Unknown URLs show "Page not found"             | `App.test.tsx`: at `/does-not-exist` the text "Page not found" is shown.                                                                  |
| Task: the navigation is rendered only once     | `App.test.tsx`: on every page there is exactly one `navigation` (`getAllByRole("navigation")` has length 1), also on "Page not found".    |
| Decision 1: navigation while loading and error | `App.test.tsx`: the navigation is also shown while loading and after a failed request.                                                    |

Existing tests stay unchanged.

## Files

- New: `src/components/Navigation.tsx` with a `<nav aria-label="Main navigation">` and two `NavLink`s: "Spotlight" to `/` (with `end`) and "Gallery" to `/art-pieces`.
- Change: `src/App.tsx`. `Navigation` is rendered once and is always visible. Only the content is replaced by "Loading..." or the error message. A route `*` shows "Page not found".
- New tests: `Navigation.test.tsx`. `App.test.tsx` gets more tests.
- New: `docs/plans/6-app-navigation-design.md` (this plan).
- `styles.css` stays unchanged.

## Out of scope

- The links "Favorites" and Details (later issues). The navigation has only Spotlight and Gallery, like the issue says.
- A designed "Page not found" page, only a simple text.
- Changes to config, workflows or rules.

## Decisions (open questions, answered)

1. The navigation is always visible. Only the content is replaced by "Loading..." or the error message.
2. "Page not found" needs no data, but is shown like all routes after the data is loaded.
3. The highlight uses the class `active` of `NavLink` and the existing styles, no new CSS.
4. The `nav` gets `aria-label="Main navigation"`.
5. The `h1` "Art Gallery" stays in `App` on all pages, also on "Page not found".
