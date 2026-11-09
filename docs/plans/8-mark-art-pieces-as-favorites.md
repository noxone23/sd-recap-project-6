# Plan for issue 8: Mark Art Pieces as Favorites

Issue: https://github.com/noxone23/sd-recap-project-6/issues/8

## Context

Users mark art pieces as favorites on the Gallery, Spotlight and Details pages. One reusable `FavoriteButton` is shown on all three. The favorite status lives in `App` (the component with the `Routes`), connected to the fetched art pieces by `slug`. The fetched data stays unchanged.

## Current state

- `App` renders `Spotlight`, `ArtPieceList` and `ArtPieceDetailsRoute`; none has favorite state.
- `ArtPiecePreview` is `li.art-piece` (position: relative) with a `Link` around image and title.
- `styles.css` already has `.favorite-button` (absolute, top right, round) and `.favorite-button[aria-pressed="true"]` (pink). `.art-piece` is `position: relative`, `.spotlight` and `.details` are not.
- No icon package is installed (`lucide-react` is not in `package.json`), so it has to be added.

## Tests (written first)

| Acceptance criterion | Test |
| --- | --- |
| Button on each list entry | `ArtPiecePreview.test.tsx`: a favorite button is displayed. `ArtPieceList.test.tsx`: one button per entry. |
| Button on the details view | `ArtPieceDetails.test.tsx`: a favorite button is displayed. |
| Button on the spotlight view | `Spotlight.test.tsx`: a favorite button is displayed. |
| Click on a non-favorite saves it, visual indication | `FavoriteButton.test.tsx`: `aria-pressed="false"` before, click calls `onToggle`. `App.test.tsx`: click in the gallery, that button gets `aria-pressed="true"`. |
| Click on a favorite removes it, visual indication | `App.test.tsx`: second click, `aria-pressed="false"` again. |
| Favorites are highlighted | `FavoriteButton.test.tsx`: `isFavorite` gives `aria-pressed="true"` (existing CSS colors it). `App.test.tsx`: the status is kept across routes (favorite in the gallery, still pressed on its details page). |

Existing tests change only by passing the new props (`isFavorite`, `onToggleFavorite`) and no assertion is changed.

## Files

- Change: `package.json` and `package-lock.json`: add `lucide-react`.
- New: `src/components/FavoriteButton.tsx`: props `name`, `isFavorite`, `onToggle`. A `button.favorite-button` with `aria-label="Favorite <name>"`, `aria-pressed` and the `Heart` icon (`aria-hidden`, filled when favorite).
- Change: `src/types.ts`: add `ArtPieceInfo { slug: string; isFavorite: boolean }` (like the hint).
- Change: `src/App.tsx`: state `artPieceInfo: ArtPieceInfo[]`, a `toggleFavorite(slug)` function, a lookup `isFavorite(slug)`; pass both down to `Spotlight`, `ArtPieceList` and `ArtPieceDetailsRoute`.
- Change: `ArtPieceList.tsx`, `ArtPiecePreview.tsx` (button next to the `Link`, not inside it), `Spotlight.tsx`, `ArtPieceDetails.tsx`: add the props and the button.
- Change: `src/styles.css`: `position: relative` for `.spotlight` and `.details`, so the existing absolute button is placed on the image.
- New/changed tests as in the table, plus `docs/plans/8-mark-art-pieces-as-favorites.md` (this plan).

## Out of scope

- A Favorites page and navigation link (later issue).
- Saving favorites over a reload (issue only asks for state).
- Changes to the fetched art pieces, config, workflows or rules.

## Decisions (open questions, answered)

1. Heart icon: `lucide-react` (`Heart`), as the hint suggests. New dependency in `package.json` and `package-lock.json` (`npm install lucide-react`). The icon is filled when the piece is a favorite.
2. Favorites only in `App` state, no `localStorage`.
3. Accessible name: fixed label `Favorite <name>` plus `aria-pressed`.

## Verification

`npm run check`, `lint`, `format:check`, `test:run`, `build`. Then `npm run dev`: click the heart in the gallery, on the spotlight and on the details page; check that the status stays when navigating between pages.
