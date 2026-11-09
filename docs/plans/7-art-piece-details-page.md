# Plan for issue 7: Art Piece Details Page

Issue: https://github.com/noxone23/sd-recap-project-6/issues/7

## Context

A user clicks an art piece in the Gallery and sees all details (image, title, artist, year, genre) on `/art-pieces/:slug`, with a back button to the list. Unknown slugs show "Art piece not found".

## Current state

- `App` fetches all art pieces with SWR and renders `Routes` (`/`, `/art-pieces`, `*`). `Navigation` is rendered once outside the routes.
- `ArtPiecePreview` shows image, name and artist, with no link.
- `ArtPiece` in `src/types.ts` has only `slug`, `name`, `artist`, `imageSource`. `year` and `genre` are missing. I could not check the API response (a `curl` was denied), so I assume the API returns `year` and `genre`. To be verified.
- `styles.css` already has a `.details img` rule (width 100%, max-height 32rem, contain). No new CSS is needed.

## Tests

Tests are written first (Vitest, React Testing Library, `user-event`).

| Acceptance criterion                         | Test                                                                                                                                   |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Clicking a piece in the list opens the page  | `ArtPiecePreview.test.tsx`: inside a `MemoryRouter`, a link to `/art-pieces/the-harvesters` exists. `App.test.tsx`: start at `/art-pieces`, click the piece, the details are shown. |
| Route `/art-pieces/:slug`                    | `App.test.tsx`: at `/art-pieces/the-harvesters` the details of that piece are shown.                                                   |
| Image displayed                              | `ArtPieceDetails.test.tsx`: `img` with name as alt and the `src`.                                                                      |
| Title displayed                              | `ArtPieceDetails.test.tsx`: heading with the name.                                                                                     |
| Artist displayed                             | `ArtPieceDetails.test.tsx`: text with the artist.                                                                                      |
| Year displayed                               | `ArtPieceDetails.test.tsx`: text with the year.                                                                                        |
| Genre displayed                              | `ArtPieceDetails.test.tsx`: text with the genre.                                                                                       |
| Back button displayed                        | `ArtPieceDetails.test.tsx`: a button/link "Back".                                                                                      |
| Back navigates to the list                   | `App.test.tsx`: at `/art-pieces/the-harvesters`, click "Back", the list with all pieces is shown.                                      |
| Unknown slug shows "Art piece not found"     | `App.test.tsx`: at `/art-pieces/unknown`, the text "Art piece not found" is shown and nothing crashes.                                 |

Existing tests stay unchanged, except that `ArtPiecePreview.test.tsx` and `ArtPieceList.test.tsx` need a router around the component once the preview contains a `Link`. Test fixtures get `year` and `genre` (required by the type).

## Files

- Change: `src/types.ts`: add `year: string` and `genre: string` to `ArtPiece`.
- New: `src/components/ArtPieceDetails.tsx`: props `artPiece`; renders `<section className="details">` with `img`, `h2`, artist, year, genre and a "Back" link to `/art-pieces`.
- Change: `src/components/ArtPiecePreview.tsx`: wrap image and title in a `Link` to `/art-pieces/${slug}`.
- Change: `src/App.tsx`: new route `/art-pieces/:slug`. A small wrapper component reads `slug` with `useParams`, finds the piece in `artPieces` and renders `ArtPieceDetails` or `<p>Art piece not found</p>`.
- New tests: `ArtPieceDetails.test.tsx`. More tests in `App.test.tsx`, `ArtPiecePreview.test.tsx`, `ArtPieceList.test.tsx` (router wrapper).
- New: `docs/plans/7-art-piece-details-page.md` (this plan).

## Out of scope

- Favorites button, color palette and comments (the CSS exists for them, but later issues).
- A designed "not found" page, only simple text.
- Linking the Spotlight image to the details page.
- Config, workflow or rule changes.

## Open questions (recommended answers)

1. Does the API return `year` and `genre`? Recommended: yes, add both as `string` to the type. Please confirm the field names.
2. Back button: a `Link` to `/art-pieces` (always works, also on deep links) rather than `navigate(-1)`. Recommended: `Link`, styled as a button-like link.
3. Link target in the preview: wrap image and title in the `Link`, not the whole `li`.

## Verification

`npm run check`, `lint`, `format:check`, `test:run`, `build`. Then `npm run dev` and click through Gallery, details, Back, and a deep link `/art-pieces/the-harvesters` and `/art-pieces/unknown`.
