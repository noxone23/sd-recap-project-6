# Plan: Polish Spotlight, Details and Not-found Pages (issue #39, board 20)

## Context

The pages work, but they have dead ends and little orientation: the Spotlight shows no title and its image leads nowhere, the two "not found" messages have no way out, the browser tab always says the same, and "Back" on the details page always goes to the gallery, even from Favorites. Issue #39 fixes exactly these points. Nothing else.

Findings from the code:

- `ArtPiecePreview` (used by Gallery and Favorites through `ArtPieceList`) already links to `/art-pieces/<slug>` with a `Link`.
- `Spotlight.test.tsx` renders `Spotlight` without a router. A `Link` needs one, so these tests get a `MemoryRouter` wrapper (the only adjustment of existing tests, needed because of the new link).
- `App.tsx` knows the route and the art pieces, so the page title is derived there. `/art-pieces/` (trailing slash) already counts as the gallery.
- `getByText("Page not found")` / `("Art piece not found")` in `App.test.tsx` keep working if the text stays in its own element.

## Tests (each written first, must fail for the right reason)

| Acceptance criterion | Test |
|---|---|
| Spotlight shows the name as a heading | `Spotlight.test.tsx`: heading with the name of the selected piece |
| Spotlight image opens the details page | `Spotlight.test.tsx`: link around the image has `href="/art-pieces/<slug>"`; `App.test.tsx`: click on the image shows the details |
| "Art piece not found" has a link to the gallery | `App.test.tsx` on `/art-pieces/unknown`: link "Back to gallery" with `href="/art-pieces"` |
| "Page not found" has a link to the gallery | `App.test.tsx` on `/does-not-exist`: same link |
| Same for the shared component | `NotFound.test.tsx`: shows the message and the link |
| Tab title per page | `getPageTitle.test.ts` (pure function): `/`, `/art-pieces`, `/art-pieces/` (trailing slash), `/favorites`, details with name, unknown slug, unknown URL. `App.test.tsx`: `document.title` per route, changes after navigation, "Art Gallery" while loading and on error |
| Back returns to the page the user came from | `ArtPiecePreview.test.tsx`: link carries the current path and search as state. `ArtPieceDetails.test.tsx`: with state from `/favorites` the link goes to `/favorites`; without state to `/art-pieces`; invalid state (not a string, not starting with `/`) falls back to `/art-pieces`. `App.test.tsx`: Favorites -> details -> Back shows Favorites; Gallery with search `?q=gogh` -> details -> Back keeps the search; deep link -> Back shows the gallery (existing test stays) |
| Existing behavior unchanged | All other existing tests stay untouched and green |

## Files

New:

- `src/getPageTitle.ts` + `src/getPageTitle.test.ts`: pure function `getPageTitle(pathname, artPieces)` using `matchPath` from `react-router`.
- `src/components/NotFound.tsx` + `NotFound.test.tsx`: `<p>{message}</p>` and `<Link to="/art-pieces">Back to gallery</Link>`, used for both messages (avoids duplicate code).

Changed:

- `src/components/Spotlight.tsx`: `<h2>` with the name, image wrapped in `Link` to `/art-pieces/<slug>`.
- `src/components/Spotlight.test.tsx`: wrap the existing renders in `MemoryRouter` (assertions unchanged), add the two new tests.
- `src/components/ArtPiecePreview.tsx` (+ test): `Link` gets `state={{ from: pathname + search }}` from `useLocation()`.
- `src/components/ArtPieceDetails.tsx` (+ test): Back link target from `useLocation().state.from`, validated, fallback `/art-pieces`.
- `src/App.tsx` (+ `App.test.tsx`): `useEffect` sets `document.title` from `getPageTitle` and restores the previous title on cleanup; the two messages use `NotFound`.
- `src/styles.css`: only if the new heading or the link around the image needs a rule (`.spotlight p` and `.spotlight img` rules already exist; check in the browser).

Titles: `Art Gallery` (Spotlight, loading, error), `Gallery – Art Gallery`, `Favorites – Art Gallery`, `<Name> – Art Gallery`, `Art piece not found – Art Gallery`, `Page not found – Art Gallery`.

## Added after approval (requested during the review)

- `src/App.tsx` (+ `App.test.tsx`): the header title "Art Gallery" is a `Link` to `/` with `tabIndex={-1}`, so the tab order (search, theme toggle, navigation) stays the same. Tests: click leads to the Spotlight; the link has `href="/"` and `tabindex="-1"`.
- `src/styles.css`: "Back to gallery" gets the button style of "Back" (`main > a` next to `.details > a`); the header title link has no underline.
- Both back elements stay links with a button look (not real buttons), so no existing test changes.

## Out of scope

- `<dl>` for year/genre/artist, order of `<h2>` and image on the details page, `loading="lazy"`, `revalidateOnFocus`.
- Fixed Spotlight piece across page changes (it stays random per visit).
- A designed 404 page, focus/scroll reset on route change.
- Any change to `.claude/settings.json`.

## Decisions (approved with the plan)

1. **Back from the Spotlight:** the Spotlight image link sets no state, so Back leads to the gallery. The Spotlight shows a new random piece on return, so "back" would not be the same page.
2. **Branch and plan name:** `feature/39-polish-spotlight-details-not-found` and this file, with the GitHub number 39 as given to `/plan-feature`.
3. **Spotlight tab title:** plain `Art Gallery`, as in the issue.

## Verification

- `npm run check`, `npm run lint`, `npm run format:check` (CRLF noise locally, CI decides), `npm run test:run`, `npm run build`.
- Each new test fails first for the right reason, then passes.
- By hand with `npm run dev`: Spotlight heading and image link; "not found" links on `/art-pieces/unknown` and `/xyz`; tab titles on all pages; Back from Gallery (with a search), from Favorites and from a deep link; both themes.
