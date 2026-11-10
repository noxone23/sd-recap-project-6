# Plan: Issue #13 – Bonus: Testing Components

## Context
Issue 13 asks for automated component tests for Spotlight, art piece preview and list, navigation and art piece details. Exploration shows that `*.test.tsx` files for all of these already exist (added in the earlier issues). So this issue is mostly a verification plus closing a few small gaps. Nothing was run yet; coverage was only read.

## Tests (per acceptance criterion / task)
| Task | Existing test | Planned addition |
|---|---|---|
| Spotlight | `Spotlight.test.tsx` (image, artist, favorite button, stable pick, empty list) | none |
| Preview and list | `ArtPiecePreview.test.tsx`, `ArtPieceList.test.tsx` (link href, list items, aria-pressed, toggle with slug) | none |
| Navigation links | `Navigation.test.tsx` (3 links + hrefs, active on `/` and `/art-pieces`) | add: `active` class on `/favorites` |
| Art piece details | `ArtPieceDetails.test.tsx` (image, title, artist/year/genre, palette, comments, form, back link) | add: clicking the favorite button calls `onToggleFavorite`; submitting the form calls `onAddComment` with the text |

Steps:
1. Run `npm run test:run` and `npm run coverage` to confirm the existing tests pass and see real coverage of the five components.
2. Write the 3 missing tests first (they should already pass, since the code exists; check each one fails when the behavior is broken).
3. Run `check`, `lint`, `format:check`, `test:run`, `build`.

## Files
- Modify: `src/components/Navigation.test.tsx`, `src/components/ArtPieceDetails.test.tsx`
- Create: `docs/plans/13-testing-components.md` (this plan)
- No production code changes.

## Out of scope
- Changing components, `App.tsx` or `vite.config.ts`.
- Tests for `ColorPalette`, `CommentForm`, `Comments`, `FavoriteButton` and `App` (already tested, not in the issue).
- Lowering thresholds or changing existing tests.

## Open questions
1. Add the 3 small gap tests (recommended), or close the issue as already done with no changes?
2. If real coverage (step 1) shows other gaps in the five components, add tests for those too?

## Verification
`npm run check`, `lint`, `format:check`, `test:run`, `build` all green; `npm run coverage` shows the five components well covered.
