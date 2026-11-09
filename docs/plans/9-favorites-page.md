# Plan for issue 9: Favorites Page

Issue: https://github.com/noxone23/sd-recap-project-6/issues/9

## Context

Issue 9 adds a Favorites page on `/favorites` with a "Favorites" navigation link. It lists only favorite art pieces (image, title, artist, active favorite button). The favorite status already lives in `App` (`artPieceInfo`, `isFavorite`, `toggleFavorite` from issue 8). The existing `ArtPieceList` is reused with a filtered array.

## Before the workflow: the "open changes"

The 18 files shown as modified have no real content change: `git diff --stat` is empty, `core.autocrlf=true` and no `.gitattributes` only cause the LF/CRLF warnings. After approval: refresh the index and check. If real changes remain, show the diff and commit only with the user's OK.

## Tests (written first)

| Acceptance criterion | Test |
| --- | --- |
| Link "Favorites" is displayed | `Navigation.test.tsx`: link "Favorites" with `href="/favorites"` |
| Click shows the page on `/favorites` | `App.test.tsx`: click "Favorites", Favorites page is shown |
| Only favorites in a list | `App.test.tsx`: favorite one piece in the gallery, open Favorites, only that piece is listed; no favorites shows the empty text |
| Image, title, artist shown | `App.test.tsx` checks them on the page; `ArtPiecePreview` is already tested |
| Active favorite button | `App.test.tsx`: button has `aria-pressed="true"`; click removes the piece from the list |

No existing assertion is changed.

## Files

- `src/components/Navigation.tsx`: add `NavLink to="/favorites"` labeled "Favorites".
- `src/App.tsx`: route `/favorites` rendering `ArtPieceList` with `artPieces.filter((piece) => isFavorite(piece.slug))`, same `isFavorite`/`onToggleFavorite` props; empty text when the list is empty.
- Tests: `Navigation.test.tsx`, `App.test.tsx`.
- `docs/plans/9-favorites-page.md`: this plan, on branch `feature/9-favorites-page`.

## Out of scope

- Persisting favorites over a reload
- New components, styling changes, CI or config changes

## Open questions

1. Empty text when there are no favorites: proposal "No favorites yet." Is that OK?

## Verification

`npm run check`, `lint`, `format:check`, `test:run`, `build`; then `npm run dev`: favorite pieces in the gallery, open Favorites, remove one there.
