# Plan for issue 4: Gallery Page

Issue: https://github.com/noxone23/sd-recap-project-6/issues/4

## Current state

- `src/App.tsx` is a placeholder (heading plus a paragraph). There are no routes, no types and no components.
- `src/index.tsx` already wraps `App` in `BrowserRouter`. `react-router` and `swr` are installed.
- The API returns an array of art pieces with `slug`, `artist`, `name`, `imageSource`, `year`, `genre`, `colors` and `dimensions`.
- `src/styles.css` has base styles for `main` and `nav`, but nothing for a list or cards.

## Tests

Tests use Vitest and React Testing Library. The tests are written first.

| Acceptance criterion                                        | Test                                                                                   |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| All art pieces are displayed in a list                      | `ArtPieceList.test.tsx`: with 3 pieces, there is a list with 3 items.                  |
| Each image is displayed                                     | `ArtPiecePreview.test.tsx`: an `img` with `src` = `imageSource` and the name as `alt`. |
| Each title is displayed                                     | `ArtPiecePreview.test.tsx`: the `name` is visible.                                     |
| Each artist's name is displayed                             | `ArtPiecePreview.test.tsx`: the `artist` is visible.                                   |
| The list is available on `/art-pieces`                      | `App.test.tsx`: render in a `MemoryRouter` at `/art-pieces` with a mocked fetch.       |
| Loading state (task)                                        | `App.test.tsx`: a loading message shows before the data arrives.                       |
| Error state (task)                                          | `App.test.tsx`: a non-ok response shows an error message.                              |
| `fetcher` returns `ArtPiece[]` and throws on a non-ok response | `fetcher.test.ts`: success returns the data, a non-ok response rejects with an `Error`. |

`fetch` is mocked with `vi.stubGlobal` or `vi.spyOn(globalThis, "fetch")`. The SWR cache is reset between tests with `<SWRConfig value={{ provider: () => new Map() }}>`.

## Files

- New: `src/types.ts` with `ArtPiece` (only `slug`, `name`, `artist`, `imageSource`).
- New: `src/fetcher.ts` with `fetcher(url): Promise<ArtPiece[]>`. It throws an `Error` when `!response.ok`.
- New: `src/components/ArtPieceList.tsx` (a `<ul>` of previews).
- New: `src/components/ArtPiecePreview.tsx` (`<li>` with image, title and artist).
- Change: `src/App.tsx`: fetch once with `useSWR`, loading and error states, a `Route` for `/art-pieces`.
- No change to `src/styles.css`: `.art-list` and `.art-piece` already exist there.
- New tests next to the source: `fetcher.test.ts`, `ArtPieceList.test.tsx`, `ArtPiecePreview.test.tsx`, `App.test.tsx`.
- New: `docs/plans/4-gallery-page.md` (this plan).

## Out of scope

- The Spotlight, Favorites and Details pages, and links from a preview to Details.
- The navigation bar, likes and comments.
- A redirect from `/` to `/art-pieces`.
- Typing the properties we don't use yet (`year`, `genre`, `colors`, `dimensions`).
- Any config, workflow or rule changes.

## Decisions (open questions, answered)

1. Fetch once in `App.tsx` and pass `artPieces` down as props, so later pages can reuse the data.
2. Loading and error states are simple text (`Loading...`, `Failed to load art pieces.`) in `App`, shown instead of the routes.
3. `/` stays empty for now, no redirect.
4. The `alt` text of an image is the name of the art piece.
5. Images are sized with CSS (`width: 100%`, `height: auto`), without `width` or `height` attributes.
