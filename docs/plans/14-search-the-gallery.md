# Plan: Issue 14 – Search the Gallery (GitHub #28)

## Context
The Gallery page (`/art-pieces`) shows all art pieces at once. Issue 14 adds a "Search" text field that filters the list by title or artist while typing. Only the Gallery changes; Favorites and Spotlight stay as they are. The search text is only needed on the Gallery page, so it lives there and not in `App`.

## Design
- **`src/filterArtPieces.ts`** (new, pure function): `filterArtPieces(artPieces, query)`. It trims the query, compares lower case with lower case, and keeps a piece if the title or the artist includes the text. An empty (or only spaces) query returns all pieces. It follows the pattern of `getRandomArtPiece.ts` (logic in a plain module next to `App.tsx`, own `.test.ts`).
- **`src/components/SearchField.tsx`** (new): props `value` and `onChange(value)`. A visible `<label htmlFor="search">Search</label>` and a controlled `<input id="search" type="search">`, in the style of `CommentForm`. The role is `searchbox`.
- **`src/components/Gallery.tsx`** (new): props `artPieces`, `isFavorite`, `onToggleFavorite`. It holds `useState("")` for the text, computes the filtered list from the props and the text (not state), and renders `SearchField` and then `ArtPieceList`, or `<p role="status">No art pieces found</p>` when the filtered list is empty (the `status` role was added after the review so screen readers announce it).
- **`src/App.tsx`**: the `/art-pieces` route renders `<Gallery .../>` instead of `<ArtPieceList .../>`. Nothing else changes. `ArtPieceList` is not changed (it has no empty state; the caller handles it).

## Tests (per acceptance criterion)
Written first, one at a time, each seen failing for the right reason.
| Acceptance criterion | Test |
|---|---|
| Gallery has a text field labeled "Search" | `SearchField.test.tsx`: searchbox with name "Search"; `App.test.tsx`: field on `/art-pieces` |
| Typing filters by title or artist | `filterArtPieces.test.ts`: title match, artist match, no match; `Gallery.test.tsx`: typing shows only matching pieces |
| Ignores upper/lower case | `filterArtPieces.test.ts` (and one in `Gallery.test.tsx`) |
| Ignores spaces at start and end | `filterArtPieces.test.ts`: "  van gogh  " |
| Empty field shows all | `filterArtPieces.test.ts`: "" and "   "; `Gallery.test.tsx`: clearing the text shows all again |
| No match shows "No art pieces found" | `Gallery.test.tsx` and `App.test.tsx` |
| Favorite button of a found piece still works | `App.test.tsx`: search, click the favorite button, the piece shows as a favorite on `/favorites` |
| Favorites and Spotlight not changed | Existing `App.test.tsx` tests stay green; new `App.test.tsx` test: no search field on `/favorites` and `/` |
Also `SearchField.test.tsx`: `onChange` is called with the typed text; the input shows `value`.

## Files
- Create: `src/filterArtPieces.ts`, `src/filterArtPieces.test.ts`, `src/components/SearchField.tsx`, `src/components/SearchField.test.tsx`, `src/components/Gallery.tsx`, `src/components/Gallery.test.tsx`
- Modify: `src/App.tsx` (the `/art-pieces` route and one import), `src/App.test.tsx` (new tests only; existing tests unchanged)
- Create: `docs/plans/14-search-the-gallery.md` (this plan)

## Out of scope
- Search on the Favorites page or the Spotlight page.
- A genre filter, sorting, a submit button, debounce, highlighting of the match, saving the search text.
- Styling beyond what the existing CSS already gives (the CSS issue 15 styles the field).
- Changes to `ArtPieceList`, `ArtPiecePreview` or the data fetching.

## Notes
- The search text is reset when the user leaves the Gallery (it is the state of the page component). The issue does not ask for more.
- The new field adds no `listitem` and no `img`, so the existing list counts in `App.test.tsx` stay valid.
- Code style as in the project: default export, `<Name>Props` interface, `import type`, Prettier, sonarjs.

## Open questions
1. File name and place: `Gallery.tsx` in `src/components/` as a page component (recommended), or a small route wrapper inside `App.tsx` like `ArtPieceDetailsRoute`?
2. Should a search that finds nothing keep showing the field (yes, recommended) so the user can correct the text?

## Verification
`npm run check`, `lint`, `format:check`, `test:run`, `build` all green; `npm run coverage` shows the new files covered; a short manual check with `npm run dev`: type in the field, clear it, search for nonsense, mark a found piece as favorite.
