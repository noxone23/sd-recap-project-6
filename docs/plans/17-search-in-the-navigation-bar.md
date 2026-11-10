# Plan: Issue 17 – Search in the Navigation Bar (GitHub #33)

## Context
The search field was inside the Gallery page. Issue 17 moves it into the header, so it is on every page, and keeps the search text in the address (`?q=`). Typing on another page opens the Gallery with the filtered list. Decided with you: the field is on every page, the phone header has three rows. While looking at the result in the browser, the layout was changed on request (see "Header layout"); this plan describes what was built.

## Design
- **`Gallery.tsx`**: no state and no search field any more. Prop `query: string`; it renders `filterArtPieces(artPieces, query)` and, when nothing matches, `<p role="status">No art pieces found</p>`.
- **`SearchField.tsx`**: a controlled field (`value`, `onChange`) with the label "Search", the placeholder "Search by title or artist" and a magnifier icon (`Search` from `lucide-react`, already installed, `aria-hidden`). For the icon it has a `div` with the class `search-field` around the label, the icon and the input.
- **`App.tsx`**:
  - `useSearchParams`, `useLocation` and `useNavigate`. `query` is the `q` parameter, but only on `/art-pieces` (a slash at the end is allowed); on every other page the field is empty.
  - `handleSearch(value)`: on the Gallery it calls `setSearchParams(value ? { q: value } : {}, { replace: true })` (no history entry per letter, an empty value removes `?q=`); on another page it calls `navigate({ pathname: "/art-pieces", search: ?q=… })` once, so Back leads to the page where the search started. An empty value on another page does nothing.
  - The header is `<header><h1/><SearchField/><ThemeToggle/><Navigation/></header>` and is shown while loading and on an error too. The route `/art-pieces` renders `<Gallery query={query} .../>`.
  - The `NavLink`s have no `?q`, so a click on a link shows the page without a search text and the field is empty. The Favorites page does not use `q`.
- **Header layout (`styles.css`)**:
  - Desktop: a grid over the full width. Row 1: the title on the left edge, the search field filling the space (no box, only a thin line below it), the theme toggle on the right edge. Row 2: the navigation, centered over the whole width. The header is about 105 px high.
  - Phone (max 40 rem): row 1 the title, row 2 the search field and the toggle next to it, row 3 the navigation, about 119 px high. The markup order equals the visual order.
  - The label "Search" is hidden visually in the header (not removed). On focus the line gets thick (3 px) with a soft shadow, and the icon turns dark; there is no blue ring.
  - The color blobs in the header are larger (28 by 14 rem) and moved down for the higher header; the pink one is centered under the navigation and drifts to both sides.
  - `scroll-padding-top` is 7 rem on the desktop and 8.5 rem on a phone, so the sticky header does not cover a focused element.

## Tests (per acceptance criterion)
Written first, one at a time, each seen failing for the right reason. A helper in `App.test.tsx` renders `App` next to a small component that shows `useLocation()` (path and search) and has a "Go back" button.

| Acceptance criterion | Test |
|---|---|
| Field in the header on every page | `App.test.tsx`: searchbox "Search" inside the `banner` on `/`, `/art-pieces`, `/favorites`, a details page and an unknown path, and also when loading fails |
| Gallery has no own field | `App.test.tsx`: exactly one searchbox on `/art-pieces`; `Gallery.test.tsx`: no searchbox |
| Typing opens the Gallery and filters | `App.test.tsx`: typing "van gogh" on `/` gives `/art-pieces` with `q=van gogh` and 1 piece; typing on `/art-pieces` keeps the path; the rules of the search (case, spaces, empty) are in `filterArtPieces.test.ts` and `Gallery.test.tsx` |
| Text kept in the address | `App.test.tsx`: `/art-pieces?q=gogh` and `/art-pieces/?q=gogh` show the field filled and 1 piece; special characters `& + % #` are encoded in the address |
| No history entry per letter, Back works | `App.test.tsx`: Back after typing on `/` leads to `/` with an empty field; typing in the Gallery adds no entry |
| Clearing shows all, stays in the Gallery | `App.test.tsx`: type and clear: all pieces, path `/art-pieces`, empty `search` of the address; only spaces also show all pieces |
| "No art pieces found" | `Gallery.test.tsx` (status message, no list) and `App.test.tsx` |
| Favorite button of a found piece works | `Gallery.test.tsx` and the existing `App.test.tsx` test |
| Phone header, three rows, compact | Chrome driven by script: 360, 390 and 500 px, about 119 px high, no horizontal overflow (not a jsdom test) |
| Keyboard, focus, tab order, both themes | `App.test.tsx`: tab order is the field, the toggle, the three links; `SearchField.test.tsx`: the icon is hidden from screen readers; Chrome: real key presses, the focus style and screenshots in the light and the dark theme |
| Only tests that expect the field in the Gallery change | see the next section |

Also covered: the Favorites page is not filtered by `q` (`/favorites?q=zzz`), and a click on the "Gallery" link drops the search text.

## Existing tests that had to change (allowed by the issue)
- `Gallery.test.tsx` was rewritten for the `query` prop (6 tests instead of 7).
- `App.test.tsx`: the two tests "shows no search field on the route /" and "…/favorites" were replaced by the new tests (19 new tests in the block "App search in the header").
- `SearchField.test.tsx`: one test added (the hidden icon); the others are unchanged.
- All other tests are unchanged.

## Files
- Modify: `src/components/Gallery.tsx`, `src/components/SearchField.tsx`, `src/App.tsx`, `src/styles.css`, `src/components/Gallery.test.tsx`, `src/components/SearchField.test.tsx`, `src/App.test.tsx`
- Create: `docs/plans/17-search-in-the-navigation-bar.md` (this plan)
- Not changed: `filterArtPieces.ts`, `Navigation.tsx`, `ThemeToggle.tsx`

## Out of scope
- A clear button, a submit button, a suggestion list, debounce, highlighting of the match, saving the search text anywhere but the address.
- Searching on the Favorites page (typing there opens the Gallery).
- The "back to top" button (board issue 18) and the other ideas (particles, flash of the wrong theme).

## Risks and checks
- **Typing with a router-controlled field** can drop a character or move the caret. It was checked in Chrome with real key presses on the `BrowserRouter` (typing on `/` and in the Gallery); no character was lost. The jsdom tests use `MemoryRouter`.
- **Header height:** about 105 px on a desktop (it was 65 px) and about 119 px on a phone.

## Verification
`npm run check`, `lint`, `format:check`, `test:run`, `build` green; in Chrome: typing on `/` and in the Gallery, Back, reload with `?q=`, the phone header, the focus style, light and dark screenshots.
