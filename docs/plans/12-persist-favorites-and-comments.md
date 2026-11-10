# Plan for issue 12: Bonus - Persist Favorites and Comments in the Browser

Issue: https://github.com/noxone23/sd-recap-project-6/issues/12

## Context

Favorites and comments live in `useState<ArtPieceInfo[]>([])` in `src/App.tsx:55` and are lost on reload. They are saved in `localStorage` instead. The art pieces are still fetched from the API; only `ArtPieceInfo[]` (slug, isFavorite, comments) is stored.

## Current state

- `App.tsx` holds `artPieceInfo` and updates it only through `toggleFavorite` and `addComment` (both via `setArtPieceInfo`).
- `ArtPieceInfo` is already in `src/types.ts`; no type change needed.
- `App.test.tsx` is the only test file that renders `App`. `localStorage` in jsdom is shared between tests of one file, so it must be cleared after each test.

## Tests (written first)

| Acceptance criterion | Test |
| --- | --- |
| Favorite flags persist across reloads | `App.test.tsx`: mark an art piece as favorite, unmount, render `App` again: the button has `aria-pressed="true"` and the piece is on `/favorites`. |
| Comments persist across reloads | `App.test.tsx`: add a comment, unmount, render again: the comment is shown on the details page. |
| Removing a favorite persists | `App.test.tsx`: favorite, unfavorite, re-render: `aria-pressed="false"`. |
| App works without data in local storage | `App.test.tsx`: empty `localStorage`: gallery renders, no favorites (existing tests already cover this; one explicit test that `/favorites` shows "No favorites yet."). |
| Robust against broken data (tasks hint: handle `null`/`any`) | `artPieceInfoStorage.test.ts`: `loadArtPiecesInfo` returns `[]` for no value, invalid JSON, and a non-array value; returns the saved array otherwise. `saveArtPiecesInfo` writes JSON under the key. |

## Files

- New `src/artPieceInfoStorage.ts`: `loadArtPiecesInfo(): ArtPieceInfo[]` (reads key `art-pieces-info`, handles `null`, invalid JSON and non-array with `[]`) and `saveArtPiecesInfo(info: ArtPieceInfo[]): void`.
- `src/App.tsx`: `useState<ArtPieceInfo[]>(loadArtPiecesInfo)` and a `useEffect` that calls `saveArtPiecesInfo(artPieceInfo)` when it changes.
- New `src/artPieceInfoStorage.test.ts`: unit tests for the two functions.
- `src/App.test.tsx`: new persistence tests; `localStorage.clear()` added to the existing `afterEach` (setup only, no assertion changes).
- `docs/plans/12-persist-favorites-and-comments.md`: this plan, on branch `feature/12-persist-favorites-and-comments`.

## Out of scope

- Syncing between tabs (`storage` event), versioning or migration of the stored data.
- Validating the shape of each stored entry beyond "is an array".
- Storing the art pieces themselves, changing the UI, CI or config; issue 13.

## Open questions (proposals, change if you disagree)

1. Separate module `src/artPieceInfoStorage.ts` instead of code inline in `App.tsx` (proposal: separate, so it is testable on its own and `App` stays small).
2. Storage key `art-pieces-info` (proposal: yes).
3. Corrupt or non-array data silently falls back to `[]` (proposal: yes; the app never crashes).

## Verification

`npm run check`, `lint`, `format:check`, `test:run`, `build`. Then `npm run dev`: favorite a piece and add a comment, reload the page, both are still there; clear the site data in DevTools, reload, the app still works with no favorites.
