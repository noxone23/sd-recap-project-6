# Plan for issue 11: Show Color Palette

Issue: https://github.com/noxone23/sd-recap-project-6/issues/11

## Context

The details page shows the color palette of the art piece: all colors of the art piece as a list of colored circles. The API already returns `colors` for every art piece (array of hex strings, see `README.md`), but the `ArtPiece` type does not have it yet.

## Current state

- `src/types.ts`: `ArtPiece` has `slug`, `name`, `artist`, `imageSource`, `year`, `genre` (no `colors`).
- `ArtPieceDetails.tsx` renders image, favorite button, name, artist, year, genre, `Comments` and `CommentForm`.
- `styles.css` already has `.palette` (flex row, no bullets) and `.palette li` (2.5rem circle with border), so no CSS change is needed.
- 14 test fixtures of type `ArtPiece` in 7 test files (`getRandomArtPiece.test.ts`, `App.test.tsx`, `fetcher.test.ts`, `ArtPieceDetails.test.tsx`, `ArtPieceList.test.tsx`, `ArtPiecePreview.test.tsx`, `Spotlight.test.tsx`).

## Tests (written first)

| Acceptance criterion | Test |
| --- | --- |
| Details page displays a list of all colors | `ColorPalette.test.tsx`: list labeled "Color palette" with one list item per color. `ArtPieceDetails.test.tsx`: the palette is displayed with the colors of the art piece. `App.test.tsx`: on `/art-pieces/the-harvesters` all colors of that art piece are listed. |
| Colors are displayed visually | `ColorPalette.test.tsx`: each list item has the color as `background-color` (`toHaveStyle`). |

## Files

- `src/types.ts`: `ArtPiece` gets `colors: string[]` (required, as decided).
- New `src/components/ColorPalette.tsx`: props `colors`; `ul.palette` with `aria-label="Color palette"`, one `li` per color with `style={{ backgroundColor: color }}` and `title={color}`; the key is the color.
- `src/components/ArtPieceDetails.tsx`: render `<ColorPalette colors={artPiece.colors} />` below the genre, before the comments.
- Tests: new `ColorPalette.test.tsx`; changed `ArtPieceDetails.test.tsx` and `App.test.tsx` (new tests).
- Test fixtures: add a `colors` array to the 14 `ArtPiece` fixtures in the 7 test files above. Only test data changes, no assertion and no test is changed.
- `docs/plans/11-show-color-palette.md`: this plan, on branch `feature/11-show-color-palette`.

## Out of scope

- Copying a color on click, showing hex codes or color names, extracting colors from the image.
- Showing the palette in the gallery, spotlight or favorites list.
- Styling, CI or config changes; issues 12 and 13.

## Open questions (proposals, change if you disagree)

1. Each circle gets a `title` with its hex code (tooltip) but no visible text (proposal: yes).
2. Placement: between the genre and the comments (proposal: yes).

## Verification

`npm run check`, `lint`, `format:check` (red locally only because of CRLF, see PR 22), `test:run`, `build`. `tsc` also proves that all fixtures have `colors`. Then `npm run dev`: open a details page and compare the circles with the colors of the image.
