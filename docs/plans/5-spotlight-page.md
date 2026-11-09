# Plan for issue 5: Spotlight Page

Issue: https://github.com/noxone23/sd-recap-project-6/issues/5

## Current state

- `App` fetches the art pieces once with `useSWR` and shows a loading and an error state. There is only the route `/art-pieces`, `/` is empty.
- `ArtPiece` has `slug`, `name`, `artist` and `imageSource`. That is enough for the spotlight.
- `src/styles.css` already has `.spotlight img`, `.art-piece img` and `.art-piece h2, p`. No new styles are needed.

## Tests

Tests use Vitest and React Testing Library. The tests are written first.

| Acceptance criterion                                    | Test                                                                                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| One art piece is randomly selected as spotlight feature | `getRandomArtPiece.test.ts`: `Math.random` at `0` returns the first, at `0.999` the last, at `0.5` the middle piece. A single piece is always returned. |
| The image is displayed                                  | `Spotlight.test.tsx`: an `img` with `src` = `imageSource` and the name as `alt`.                                                                  |
| The artist's name is displayed                          | `Spotlight.test.tsx`: the `artist` is visible.                                                                                                    |
| The spotlight is available on the route `/`             | `App.test.tsx`: render at `/` with a mocked fetch shows the spotlight.                                                                            |
| Hint: the piece is picked only once                     | `Spotlight.test.tsx`: after `rerender` with the same props the same piece stays, although `Math.random` now returns another value.                |
| Empty list (decision 2)                                 | `Spotlight.test.tsx`: with `[]` nothing is rendered and nothing crashes.                                                                          |

Existing tests stay unchanged. `/art-pieces` stays covered by the existing tests.

## Files

- New: `src/getRandomArtPiece.ts` with `getRandomArtPiece(artPieces: ArtPiece[])` (`Math.floor(Math.random() * length)`, like the MDN example).
- New: `src/components/Spotlight.tsx`. It takes `artPieces` as a prop and picks once with `useState(() => getRandomArtPiece(artPieces))`. It shows the image (`alt` = `name`) and the artist, with the class `spotlight`.
- Change: `src/App.tsx` gets `<Route path="/" element={<Spotlight artPieces={artPieces} />} />`.
- New tests: `getRandomArtPiece.test.ts`, `Spotlight.test.tsx`. `App.test.tsx` gets one more test.
- New: `docs/plans/5-spotlight-page.md` (this plan).

## Out of scope

- A link from the spotlight to Details and the favorite button (later issues).
- The navigation.
- Showing title, year or genre.
- Changes to config, workflows or rules.

## Decisions (open questions, answered)

1. No title is shown, only the image and the artist (the name is the `alt` text).
2. With an empty list the spotlight renders nothing.
3. A new piece is picked on every visit of `/`, the pick stays the same within a visit. It is not cached in `App`.
4. `Math.random` is mocked with `vi.spyOn`, the signature stays like the MDN example.
5. The `h1` "Art Gallery" stays in `App`.
