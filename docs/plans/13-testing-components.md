# Plan: Issue #13 – Bonus: Testing Components

## Context
Issue 13 asks for automated component tests for Spotlight, art piece preview and list, navigation and art piece details. Test files for all of these already existed (added in earlier issues). So this issue checks each task against its component and closes the gaps. Every task was compared with the component and its tests, even where tests already existed.

## Tests (per task)
| Task | Existing test | Added |
|---|---|---|
| Spotlight | `Spotlight.test.tsx` (image, artist, favorite button, stable pick, empty list) | favorite button is pressed for a favorite; clicking it calls `onToggleFavorite` with the slug |
| Preview and list | `ArtPiecePreview.test.tsx`, `ArtPieceList.test.tsx` (link href, list items, aria-pressed, toggle with slug) | preview: favorite button is pressed for a favorite; clicking it calls `onToggleFavorite` |
| Navigation links | `Navigation.test.tsx` (3 links + hrefs, active on `/` and `/art-pieces`) | `active` class on `/favorites` |
| Art piece details | `ArtPieceDetails.test.tsx` (image, title, artist/year/genre, palette, comments, form, back link) | clicking the favorite button calls `onToggleFavorite`; submitting the form calls `onAddComment` with the text |

Steps:
1. Run the existing tests and read each component against its task.
2. Add the 7 missing tests. They test existing behavior, so they pass at once; each one was checked to fail when the behavior is broken.
3. Run `check`, `lint`, `format:check`, `test:run`, `build`.

## Files
- Modify: `src/components/Spotlight.test.tsx`, `src/components/ArtPiecePreview.test.tsx`, `src/components/Navigation.test.tsx`, `src/components/ArtPieceDetails.test.tsx`
- Create: `docs/plans/13-testing-components.md` (this plan)
- No production code changes.

## Out of scope
- Changing components, `App.tsx` or `vite.config.ts`.
- Tests for `ColorPalette`, `CommentForm`, `Comments`, `FavoriteButton` and `App` (already tested, not in the issue).
- Lowering thresholds or changing existing tests.
- The `format:check` failure on Windows (CRLF vs `endOfLine: "lf"`), which exists without this branch.

## Verification
`npm run check`, `lint`, `test:run`, `build` green; `format:check` only fails for the existing line-ending problem; `npm run coverage` shows the components covered.
