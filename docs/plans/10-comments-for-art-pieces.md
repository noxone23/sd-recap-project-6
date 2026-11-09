# Plan for issue 10: Comments for Art Pieces

Issue: https://github.com/noxone23/sd-recap-project-6/issues/10

## Context

The details page gets a "Comments" section: a list of the comments of the shown art piece (text, date and time) and a form to add one. Comments are stored per art piece in the existing `artPieceInfo` state in `App` (next to `isFavorite`, connected by `slug`), as the hint suggests. No persistence (that is issue 12).

## Current state

- `types.ts` has `ArtPieceInfo { slug; isFavorite }`.
- `App.tsx` keeps `artPieceInfo`; `toggleFavorite` creates `{ slug, isFavorite: true }` when no entry exists. `ArtPieceDetailsRoute` passes `isFavorite` and `onToggleFavorite` to `ArtPieceDetails`.
- `styles.css` already has `.comments` (list, `li`, `time`) and `.comment-form`, so no CSS change is needed.
- `@testing-library/user-event` is available.

## Tests (written first)

| Acceptance criterion | Test |
| --- | --- |
| Section labeled "Comments" with a list | `Comments.test.tsx`: region named "Comments" with a list item per comment. `ArtPieceDetails.test.tsx`: the section is displayed. |
| Comment text displayed | `Comments.test.tsx` |
| Date and time displayed | `Comments.test.tsx`: `time` element with `dateTime` = stored ISO string and the text `new Date(iso).toLocaleString()` |
| Form with text field and submit button | `CommentForm.test.tsx`: labeled text field and a submit button. `ArtPieceDetails.test.tsx`: the form is displayed. |
| Submit adds the comment, only to this art piece | `CommentForm.test.tsx`: submit calls `onAddComment` with the text and clears the field. `App.test.tsx`: add a comment on one details page, it is shown; open the other art piece, no comment there; come back, comment still there. |
| Empty comments cannot be submitted | `CommentForm.test.tsx`: empty and whitespace-only submit does not call `onAddComment`. `App.test.tsx`: no list item is added. |

`Comments` renders the `ul` only when there are comments, so the existing test "shows the details after clicking an art piece in the list" (`queryByRole("list")` is absent on the details page) stays unchanged (decided during implementation). Existing tests change only by passing the new props (`comments`, `onAddComment`) in the `renderDetails` helper of `ArtPieceDetails.test.tsx`; no assertion is changed. The favorite tests in `App.test.tsx` must keep passing unchanged.

## Files

- `src/types.ts`: add `ArtPieceComment { text: string; date: string }`; `ArtPieceInfo` gets `comments: ArtPieceComment[]`.
- `src/App.tsx`: the `toggleFavorite` fallback entry becomes `{ slug, isFavorite: true, comments: [] }`. New `addComment(slug, text)` appends `{ text, date: new Date().toISOString() }` to the entry of the slug (creating `{ slug, isFavorite: false, comments: [text] }` if missing). New lookup `getComments(slug)`. `ArtPieceDetailsRoute` passes `comments` and `onAddComment` down. Behavior of favorites stays the same.
- New `src/components/Comments.tsx`: `section` with `aria-labelledby`, heading "Comments", `ul.comments`; each `li` shows the text and `<time dateTime={date}>{new Date(date).toLocaleString()}</time>`.
- New `src/components/CommentForm.tsx`: `form.comment-form` with a labeled text field "Comment" and a submit button "Add comment"; trims the text, ignores empty, calls `onAddComment(text)`, resets the field. The field also has `required`.
- `src/components/ArtPieceDetails.tsx`: new props `comments`, `onAddComment`; renders `Comments` and `CommentForm` below the info.
- Tests: new `Comments.test.tsx`, `CommentForm.test.tsx`; changed `ArtPieceDetails.test.tsx`, `App.test.tsx`.
- `docs/plans/10-comments-for-art-pieces.md`: this plan, on branch `feature/10-comments-for-art-pieces`.

## Out of scope

- Persisting comments over a reload (issue 12), deleting or editing comments, comment count in the list.
- Color palette (issue 11), bonus tests (issue 13).
- Empty-state text for "no comments yet", styling, CI or config changes.

## Open questions (proposals, change if you disagree)

1. Whitespace-only counts as empty and is not submitted (proposal: yes, via `trim()`).
2. Single-line text field (`input type="text"`) instead of a textarea (proposal: input, the issue says "text field").
3. Order: oldest first, new comments are appended at the end (proposal: yes).
4. List key: `${date}-${text}`, because the comment type from the issue has no id.

## Verification

`npm run check`, `lint`, `format:check` (red locally only because of CRLF, see PR 22), `test:run`, `build`. Then `npm run dev`: open a details page, add comments, try empty and spaces only, open another art piece (no comments), come back (comment still there).
