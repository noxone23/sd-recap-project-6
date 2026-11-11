# Plan: Show Another Spotlight (issue #43, board 22)

## Context

The Spotlight page picks one random art piece when it is first shown and keeps it (`useState` initializer in `src/components/Spotlight.tsx`). To see another piece the user has to reload or leave the page. Issue #43 adds a "Show another" button that picks a different piece. Nothing else.

Findings from the code:

- `getRandomArtPiece(artPieces)` in `src/getRandomArtPiece.ts` uses `crypto.getRandomValues`. Tests mock it with `vi.spyOn(crypto, "getRandomValues")` and a `mockRandom(fraction)` helper (same helper exists in `getRandomArtPiece.test.ts` and `Spotlight.test.tsx`).
- `Spotlight.test.tsx` already renders inside `MemoryRouter`; the favorite button and the link read from the displayed piece, so they follow the state automatically.
- Spotlight returns `null` for an empty list.

## Approach

- `getRandomArtPiece(artPieces, exclude?)`: picks from the list without `exclude`. If that leaves nothing (one piece), it returns the only piece. Existing calls without the second argument behave as before.
- `Spotlight`: `useState` keeps the piece and uses its setter. Click handler: `setArtPiece((current) => getRandomArtPiece(artPieces, current))`. The button `<button type="button">Show another</button>` is rendered only when `artPieces.length > 1`.

## Tests (each written first, must fail for the right reason)

| Acceptance criterion | Test |
|---|---|
| Spotlight has a button "Show another" | `Spotlight.test.tsx`: button with that name exists with two pieces |
| Click shows a different piece (image, artist) | `Spotlight.test.tsx`: random 0 shows piece 1; click with random 0 shows piece 2 (image `src`, name, artist) |
| New piece never equals the current one | `getRandomArtPiece.test.ts`: with `exclude`, random values 0, 0.5, 0.999 never return the excluded piece (excluded first, middle, last). `Spotlight.test.tsx`: click several times, the piece changes every time |
| One piece: no button | `Spotlight.test.tsx`: `queryByRole("button", { name: "Show another" })` is null with one piece |
| Favorite button and link belong to the new piece | `Spotlight.test.tsx`: after the click the link has `href="/art-pieces/<new slug>"` and the favorite button names the new piece |
| Existing behavior unchanged | `getRandomArtPiece` tests without `exclude` stay untouched and green; `App.test.tsx` unchanged |

## Files

Changed:

- `src/getRandomArtPiece.ts` (+ `getRandomArtPiece.test.ts`): optional `exclude` parameter.
- `src/components/Spotlight.tsx` (+ `Spotlight.test.tsx`): state setter, button.
- `src/styles.css`: only if the button needs a rule (check whether the existing button style applies in `.spotlight`).

No new files.

## Out of scope

- Remembering earlier pieces or a "previous" button.
- Animations or transitions between pieces.
- Changing the first random pick, the Gallery, Favorites or Details pages.
- Announcing the change to screen readers or moving focus (see open question).

## Open questions

1. After the click the content changes, but screen readers get no message. Should the issue include a polite live region (`aria-live="polite"` on the section), or stay as written? Recommendation: stay as written, handle it in a separate issue if wanted.

## Verification

`npm run check`, `npm run lint`, `npm run format:check`, `npm run test:run`, `npm run build`. Then a look at `/` in the browser: click several times, the piece always changes, the link and favorite star follow.

## After approval

Create branch `feature/43-show-another-spotlight`, save this plan as `docs/plans/43-show-another-spotlight.md`, commit it. No implementation, no push, no PR.
