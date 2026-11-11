# Plan: Filter the Gallery by Genre (issue #45, board 23)

## Context

The Gallery can be searched by title and artist (search field in the header, text in the address as `?q=`). Issue #45 adds a "Genre" control on the Gallery page below the header. It works together with the search, and the selected genre lives in the address too (`/art-pieces?q=gogh&genre=Baroque`). Nothing else.

Findings from the code:

- `App.tsx` reads `q` from `useSearchParams`, only on `/art-pieces` (trailing slash allowed), and passes it as `query` to `Gallery`. `handleSearch` on the Gallery calls `setSearchParams(value ? { q: value } : {}, { replace: true })`. That **drops every other parameter**, so it would delete `genre`. It must keep it.
- `Gallery.tsx` has no state; it filters with `filterArtPieces(artPieces, query)` and returns `<p role="status">No art pieces found</p>` when nothing matches. The genre control must stay visible in that case, or the user cannot undo the filter.
- `ArtPiecePreview` already passes `pathname + search` as `state.from`, and `ArtPieceDetails` validates it. "Back" keeps the genre without any change.
- Favorites and Spotlight do not use `q`; they will not use `genre` either.

## Approach

- `src/getGenres.ts`: `getGenres(artPieces)` returns every genre once, sorted alphabetically (`new Set(...)`, `localeCompare`).
- `src/filterArtPieces.ts`: new optional third parameter `genre = ""`. An empty genre means all genres; otherwise only pieces with exactly this `genre` stay. The text search is unchanged.
- `src/components/GenreFilter.tsx`: controlled `<select>` with the label "Genre", the first option "All genres" (value `""`) and one option per genre. Props `genres`, `value`, `onChange`.
- `Gallery.tsx`: new props `genre` and `onGenreChange`. It renders `GenreFilter` (genres from `getGenres(artPieces)`) and below it either the "No art pieces found" status or the list.
- `App.tsx`: `genre` is the `genre` parameter, only on the Gallery, and only when it is one of the genres of the fetched pieces (an unknown value counts as "All genres"). One helper builds the parameters from `q` and `genre` and leaves out empty ones. `handleSearch` and the new `handleGenreChange` both use it, so changing one keeps the other. Both use `replace: true`, like the search. On another page, typing in the search still navigates to `/art-pieces?q=...` without a genre.
- `src/styles.css`: a rule for the genre control (like the search field, light and dark theme). Check in the browser.

## Tests (each written first, must fail for the right reason)

| Acceptance criterion | Test |
|---|---|
| Control "Genre" with "All genres" and one option per genre, below the header | `GenreFilter.test.tsx`: labeled combobox, first option "All genres", one option per given genre. `Gallery.test.tsx`: control is in the Gallery. `App.test.tsx`: it is not inside the `banner` |
| "All genres" at the start, all pieces shown | `Gallery.test.tsx` / `App.test.tsx` on `/art-pieces`: "All genres" selected, all pieces listed |
| Selecting a genre shows only this genre | `filterArtPieces.test.ts` (genre only); `App.test.tsx`: select a genre, only matching pieces |
| Selecting "All genres" again shows all | `App.test.tsx`: select, then "All genres", all pieces, `genre` removed from the address |
| Every genre once | `getGenres.test.ts`: duplicates removed, sorted, empty list gives `[]`; `GenreFilter` or `Gallery` test with two pieces of one genre |
| Works together with the search; empty message | `filterArtPieces.test.ts`: text and genre together, no match. `App.test.tsx`: genre plus text show only pieces that match both; no match shows "No art pieces found" and the control is still there; typing keeps the genre and changing the genre keeps the text; clearing the search keeps the genre |
| Genre in the address; reload, deep link, Back | `App.test.tsx`: `/art-pieces?genre=Baroque` shows the control filled and the filtered list; `?q=gogh&genre=...` keeps both; details page then "Back" returns to the filtered Gallery; an unknown genre in the address shows all pieces with "All genres" selected |
| Favorites and Spotlight not affected | `App.test.tsx`: `/favorites?genre=Baroque` still lists all favorites; `/?genre=Baroque` shows a spotlight and no control |
| Existing behavior unchanged | All existing tests stay green. Only the `renderGallery` helper in `Gallery.test.tsx` gets the two new props because they are required (assertions unchanged) |

## Files

New:

- `src/getGenres.ts` + `getGenres.test.ts`
- `src/components/GenreFilter.tsx` + `GenreFilter.test.tsx`

Changed:

- `src/filterArtPieces.ts` (+ test)
- `src/components/Gallery.tsx` (+ test)
- `src/App.tsx` (+ `App.test.tsx`)
- `src/styles.css`

## Out of scope

- Sorting, filtering by artist or year, multiple genres at once.
- A result counter, a "clear all filters" button, genre chips.
- A genre control in the header, on Favorites or on Spotlight.
- Changing the search itself.

## Open questions

Decided as below unless you object:

1. An unknown `genre` in the address (for example a typo) is treated as "All genres", not as an empty result.
2. Genre options are sorted alphabetically.
3. Changing the genre replaces the history entry (like the search), so Back does not step through every selection.

## Verification

`npm run check`, `npm run lint`, `npm run format:check`, `npm run test:run`, `npm run build`. Then look at `/art-pieces` in the browser in both themes and on a phone width: select genres, combine with the search, reload, open a details page and go Back.

## After approval

Create branch `feature/45-filter-gallery-by-genre`, save this plan as `docs/plans/45-filter-gallery-by-genre.md`, commit it. No implementation, no push, no PR.
