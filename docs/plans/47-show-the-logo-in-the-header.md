# Plan: Show the Logo in the Header (issue #47, board 24)

## Context

The header shows the text "Art Gallery" as a link to the Spotlight page, inside the `h1`. Issue #47 replaces the text by the logo image. A throwaway test on the local branch `experiment/header-logo` showed: 3.5 rem height is too small, 6 rem looks good on a desktop. The image is used as it is (transparent PNG, 2048 × 768, no optimizing, decided by the user because this is a school project).

Findings from the code:

- `App.tsx`: `<h1 ref={titleRef} tabIndex={-1}><Link to="/" tabIndex={-1}>Art Gallery</Link></h1>`. The `h1` gets the focus after "Back to top"; the link is not a tab stop.
- Existing tests find the title as `heading` or `link` with the name "Art Gallery" (`App.test.tsx` around lines 195-215, 585, 1201-1209). The accessible name of a link with an image is the `alt` text, so these tests should stay green without changes.
- `styles.css`: the header is a grid (title, search, toggle; navigation below). `html { scroll-padding-top: 7rem }` and `8.5rem` at `max-width: 40rem` fit the old, lower header.
- `public/` already holds `favicon.ico`, and `vercel.json` rewrites only URLs that are not files, so `/logo.png` works on deep links.
- The experiment working tree also contains the gold accents (issue for that comes later). They are **not** part of this issue.

## Approach

- `public/logo.png`: the logo, unchanged copy of the file from the Desktop.
- `App.tsx`: inside the existing link, `<img className="logo" src="/logo.png" alt="Art Gallery" width="2048" height="768" />`. The `h1`, the link and `tabIndex` stay as they are.
- `styles.css`: `.logo { display: block; width: auto; height: 6rem }`; at `max-width: 40rem` a smaller height (4 rem). `scroll-padding-top` is raised to the new header height (desktop and phone). The values are estimated from the layout and checked in the browser.

## Tests (each written first, must fail for the right reason)

| Acceptance criterion | Test |
|---|---|
| Header shows the logo instead of the text | `App.test.tsx`: inside the `banner` an image named "Art Gallery" with `src` `/logo.png` |
| Alt text "Art Gallery", still inside the `h1` | `App.test.tsx`: the image is inside the heading level 1 named "Art Gallery" |
| Click leads to the Spotlight, no extra tab stop | Existing tests stay green (link `href="/"`, `tabindex="-1"`, click shows the Spotlight) |
| `img` has `width` and `height` | `App.test.tsx`: attributes `width="2048"` and `height="768"` |
| Transparent background, light and dark theme | Not testable in jsdom. Looked at in the browser by the user |
| Phone: smaller logo, no sideways scroll | Not testable in jsdom. Browser check at 360 px |
| `scroll-padding-top` fits | Not testable in jsdom. Browser check: focus an element, it is not hidden by the header |
| Search, toggle, navigation, tab order unchanged | Existing tests stay green (tab order, search in the header, theme toggle) |

If an existing test fails because of the logo, I stop and ask, I do not change it.

## Files

New:

- `public/logo.png`

Changed:

- `src/App.tsx`
- `src/App.test.tsx` (new tests only)
- `src/styles.css`

## Out of scope

- Gold accents (own issue), a smaller or optimized image, a favicon made from the logo, other logo variants for the dark theme.
- Logo anywhere else than the header, changes to the page title in the browser tab.

## Open questions

1. **The experiment:** the working tree has the logo test and the gold accents. Before the branch for this issue is created, I commit this state on the local branch `experiment/header-logo` (no push), so the gold accents are kept for the next issue. Then `main`, then `feature/47-show-the-logo-in-the-header`. Alternative: `git stash -u`. Recommendation: the commit on the experiment branch, it is harder to lose.
2. **Phone height:** 4 rem for the logo. Tell me after the browser check if it should be different.

## Verification

`npm run check`, `npm run lint`, `npm run format:check`, `npm run test:run`, `npm run build`. Then `/` and a deep link like `/art-pieces/<slug>` in the browser: logo visible in both themes, 360 px width without sideways scroll, "Back to top" and the tab order still work, the header does not cover a focused element.

## After approval

Save the experiment (see question 1), create branch `feature/47-show-the-logo-in-the-header` from `main`, save this plan as `docs/plans/47-show-the-logo-in-the-header.md`, commit it. No implementation, no push, no PR.

## Added after approval (found at the start of the implementation)

The plan said that no existing test changes. That was wrong: six tests in `App.test.tsx` (lines 110, 123, 172, 184, 201, 294) count all images with `getAllByRole("img")`, and the logo in the header is one more image. Decided with the user: these six counts are limited to the main area, `within(screen.getByRole("main")).getAllByRole("img")`. The expected numbers stay the same. This is the only change to existing tests, done first while they are green, before the logo is added.
