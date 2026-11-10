# Plan: Issue 17 – Search in the Navigation Bar (GitHub #33)

## Context
The search field is inside the Gallery page. Issue 17 moves it into the header, so it is on every page, and keeps the search text in the address (`?q=`). Typing on another page opens the Gallery with the filtered list. Decided with you: Variant 1 (the field is on every page), the toggle sits next to the title, the phone header has three rows.

## Design
- **`Gallery.tsx`**: loses its state and its `SearchField`. New prop `query: string`; it renders `filterArtPieces(artPieces, query)` and, when nothing matches, `<p role="status">No art pieces found</p>`. Everything else stays.
- **`SearchField.tsx`**: stays a controlled field (`value`, `onChange`, label "Search", placeholder). Its test is not changed.
- **`App.tsx`**:
  - `const [searchParams, setSearchParams] = useSearchParams()`, `const query = searchParams.get("q") ?? ""`, `useLocation()` for the path, `useNavigate()`. The router is already above `App` (`BrowserRouter`, `MemoryRouter` in tests).
  - `handleSearch(value)`: on `/art-pieces` it calls `setSearchParams(value ? { q: value } : {}, { replace: true })` (no history entry per letter, an empty value removes `?q=`); on any other page it calls `navigate({ pathname: "/art-pieces", search: ... })` once (one history entry, so Back leads to the page where the search started). The next letters happen on the Gallery and replace.
  - The header becomes `<header><h1/><ThemeToggle/><SearchField value={query} onChange={handleSearch}/><Navigation/></header>`; the route `/art-pieces` renders `<Gallery query={query} .../>`. The header is rendered while loading and on error, so the field is there too.
  - The `NavLink`s have no `?q`, so a click on "Gallery" or any other link shows the page without a search text and the field is empty. The Favorites page does not use `q`.
- **`styles.css`**:
  - In the header the label is hidden visually (not removed), `header input[type="search"]` becomes a flex item (`flex: 1 1 16rem; max-width: 28rem`), the title loses its `margin-right: auto` on the desktop and the navigation gets `margin-left: auto`. `#search` loses its `margin-bottom` (the field is no longer in `<main>`).
  - Phone (max 40rem): row 1 title and toggle (title `margin-right: auto`), row 2 the field (`flex: 1 0 100%`), row 3 the navigation (`width: 100%`). Smaller paddings, so the header is about 130 px or less at 390 px. `scroll-padding-top` for the phone is raised to match the new height.
  - Layout on a desktop: `Art Gallery [☾] [ search ........ ] Spotlight Gallery Favorites`. The DOM order equals the visual order on every width.

## Tests (per acceptance criterion)
Written first, one at a time, each seen failing for the right reason. A helper in `App.test.tsx` renders `App` with a small component that shows `useLocation()` (path and search) and has a "go back" button (`navigate(-1)`).

| Acceptance criterion | Test |
|---|---|
| Field in the header on every page | `App.test.tsx`: searchbox "Search" inside the `banner` on `/`, `/art-pieces`, `/favorites`, a details page and an unknown path; also while loading and on a load error |
| Gallery has no own field | `App.test.tsx`: exactly one searchbox on `/art-pieces`; `Gallery.test.tsx`: no searchbox |
| Typing opens the Gallery and filters | `App.test.tsx`: typing "van gogh" on `/` shows the Gallery with 1 piece and the location `/art-pieces` with `q=van gogh`; typing on `/art-pieces` keeps the path; the existing rules (case, spaces, empty) stay covered by `filterArtPieces.test.ts` and `Gallery.test.tsx` |
| Text kept in the address | `App.test.tsx`: opening `/art-pieces?q=gogh` shows the field with "gogh" and 1 piece |
| No history entry per letter, Back works | `App.test.tsx`: type "wheat" on `/`, then Back leads to `/` with an empty field; typing on the Gallery adds no entry (Back leaves the Gallery) |
| Clearing shows all, stays in the Gallery | `App.test.tsx`: type and clear on `/art-pieces`: all pieces, path `/art-pieces`, no `q` |
| "No art pieces found" | `Gallery.test.tsx` (query without a match gives the status message, no list); `App.test.tsx` (existing test) |
| Favorite button of a found piece works | `Gallery.test.tsx` (click calls `onToggleFavorite` with the slug) and the existing `App.test.tsx` test |
| Phone header, three rows, compact | Chrome driven by script at 390 px: three rows, height at most about 130 px, no horizontal overflow (not a jsdom test) |
| Keyboard, focus, tab order, both themes | `App.test.tsx`: Tab order in the header is toggle, field, Spotlight, Gallery, Favorites; Chrome check of the visual order, the focus and screenshots in light and dark |
| Only tests that expect the field in the Gallery change, checks pass | see the next section; `check`, `lint`, `format:check`, `test:run`, `build` |

Also new: the Favorites page is not filtered by `q` (`/favorites?q=zzz` still shows the favorite), and a click on the "Gallery" link drops the search text.

## Existing tests that have to change (allowed by the issue)
- `Gallery.test.tsx`: its 7 tests type into the field inside the Gallery, which no longer exists. They are rewritten for the `query` prop (empty query shows all, a query filters by title and by artist, a query without a match shows the message, the favorite of a found piece). The "field is present" and the typing tests are removed.
- `App.test.tsx`: "shows no search field on the route /" and "…/favorites" are replaced by the new "field on every page" test.
- Not changed: `SearchField.test.tsx`, `filterArtPieces.test.ts`, all other `App.test.tsx` tests (the search tests there type on `/art-pieces` and keep working because the field now writes `?q=` and the Gallery reads it).

## Files
- Modify: `src/components/Gallery.tsx`, `src/App.tsx`, `src/styles.css`, `src/components/Gallery.test.tsx`, `src/App.test.tsx`
- Create: `docs/plans/17-search-in-the-navigation-bar.md` (this plan)
- Not changed: `SearchField.tsx` (apart from nothing), `filterArtPieces.ts`, `Navigation.tsx`, `ThemeToggle.tsx`

## Out of scope
- A clear button, a submit button, a suggestion list, debounce, highlighting of the match, saving the search text anywhere but the address.
- Searching on the Favorites page (the field there opens the Gallery).
- The "back to top" button (board issue 18) and the other ideas (particles, flash of the wrong theme).

## Risks
- **Typing with a router-controlled field:** the router may apply the address change in a transition, which can make a controlled input drop a character or move the caret. It is checked with real key presses in Chrome. If it shows up, the field keeps its own state and syncs with `?q=`; that changes only `App.tsx`.
- **Phone height:** the target is about 130 px at 390 px; if it does not fit, paddings are reduced further, and I tell you before changing the design.
- **`scroll-padding-top`:** has to match the new phone header height, otherwise the header covers focused elements.
- **Dark theme:** the field uses the existing input variables, so it should follow; it is checked with screenshots.

## Open questions
Decided: the toggle sits next to the title, one history entry when the search starts on another page, the label "Search" is hidden visually in the header while the placeholder stays. Open: none.

## Verification
`npm run check`, `lint`, `format:check`, `test:run`, `build` green; `npm run coverage` covers the changed files; in Chrome at 390 and 1280 px: type on `/` and on the Gallery, Back, reload with `?q=`, the three-row phone header and its height, the tab order, light and dark screenshots, and no dropped characters while typing.

## Changes after the approval (what was built)
The plan above was approved first. While looking at the result in the browser, the layout was changed on request. These points replace the matching lines above:

- **Header layout:** a grid over the full width. Row 1: the title on the left edge, the search field filling the space in between, the theme toggle on the right edge. Row 2: the navigation, centered over the whole width. On a phone: title and toggle, then the search, then the navigation (123 px high at 360 to 500 px).
- **Search field:** no box any more, only a thin line below it (it gets darker and thicker on focus), with a magnifier icon in front. The icon is `Search` from `lucide-react` (already installed), hidden from screen readers. For the icon, `SearchField` got a `div` with the class `search-field` around the label, the icon and the input (the plan said `SearchField` stays unchanged); one new test checks the hidden icon.
- **Order in the markup:** title, search field, theme toggle, navigation. The tab order is search, toggle, the three links. On a phone the toggle is shown in the first row, so there the visual order differs a little from the order in the markup.
- **Color blobs:** larger (28 by 14 rem) and moved down, because the header is higher now. The pink blob is centered under the navigation and drifts to both sides.
- **Search text on other pages:** `?q=` only counts on `/art-pieces`; the field is empty on all other pages and after a click on a navigation link.
- **`scroll-padding-top`:** 7 rem on the desktop and 8.5 rem on a phone, so the sticky header does not cover a focused element.
- **Tests:** `Gallery.test.tsx` was rewritten for the `query` prop, two tests in `App.test.tsx` ("no search field on `/` and `/favorites`") were replaced, and 17 new `App` tests were added. All other tests are unchanged.
