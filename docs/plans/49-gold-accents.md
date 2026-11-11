# Plan: Gold Accents for Lines, Icons and Cards (issue #49, board 25)

## Context

The logo (issue #47) is gold. Issue #49 carries this gold into thin lines, two icons and the card borders, so the app looks like one piece. The user looked at a local test on the branch `experiment/gold-accents` in both themes, on a desktop and on a phone, and liked it: gold lines under search and genre, active navigation link, divider above the comments, gold sun/moon and "Back to top" arrow, and a 1 px gold border around the cards (not around the images). The line at the bottom of the header stays without gold.

Findings from the code:

- The whole change is in `src/styles.css`. Colors are custom properties in three blocks: `:root` (light), `:root[data-theme="dark"]` and the system dark mode (`@media (prefers-color-scheme: dark)` with `:root:not([data-theme="light"])`). The new `--gold` goes into all three, like `--focus`.
- The two icons use `currentColor` through `color: var(--ink)` on `.theme-toggle` and `.back-to-top` (lucide icons), so only that color changes.
- The cards are `.art-piece` (Gallery and Favorites through `ArtPieceList`) and the shared rule `.spotlight, .details`. All have `border: 1px solid var(--glass-edge)`.
- No test touches colors. jsdom cannot show colors, but the CSS file can be read as text in a Vitest test (`node:fs`), which can check the facts that matter: one definition per theme, where the gold is used and where not, and the contrast.
- Measured earlier: `#a37d28` on the light `--wall` `#e8ecf3` is 3.21 to 1, `#e0b95a` on the dark `--wall` `#0e1219` is 10.06 to 1.

## Approach

- `--gold: #a37d28` in the light block, `--gold: #e0b95a` in both dark blocks (the same value, like all other colors that are repeated for the system dark mode).
- Use it in `src/styles.css` for: the underline of `header input[type="search"]` and its focus (border color and the 1 px `box-shadow`); the underline of `.genre-filter select` and its focus; `nav a.active` border color; `.details h3` border-top; `color` of `.theme-toggle` and `.back-to-top`; `border` of `.art-piece` and of `.spotlight, .details`.
- Unchanged: `header` border-bottom, the focus ring `:focus-visible` (blue), buttons, favorite heart, comment boxes, image rules.

## Tests (each written first, must fail for the right reason)

New file `src/styles.test.ts`: reads `src/styles.css` as text and has a small helper that returns the declarations of every rule whose selector list contains a given selector, and a helper for the contrast of two colors (WCAG formula, a few lines).

| Acceptance criterion | Test |
|---|---|
| One gold color, defined once, three values (light, dark, system dark) | `--gold` is defined in `:root`, `:root[data-theme="dark"]` and the system dark block; the light value differs from the dark value; the two dark values are equal; the hex values appear nowhere else in the file |
| Gold underline of search and genre, also with focus | declarations of `header input[type="search"]`, its `:focus-visible`, `.genre-filter select` and its `:focus-visible` use `var(--gold)` |
| Active navigation link | `nav a.active` uses `var(--gold)` for the border |
| Divider above the comments | `.details h3` uses `var(--gold)` for `border-top` |
| Gold icons | `.theme-toggle` and `.back-to-top` use `var(--gold)` for `color` |
| Gold card borders, no frame for images | `.art-piece` and `.spotlight`/`.details` use `var(--gold)` for `border`; the rules for `.art-piece img`, `.spotlight img` and `.details img` do not contain `var(--gold)` |
| Contrast at least 3 to 1 | the contrast of the light gold on the light `--wall` and of the dark gold on the dark `--wall` is at least 3 |
| Header bottom line stays without gold | the declarations of `header` do not contain `var(--gold)` |
| Focus ring stays blue; heart, buttons, comment boxes keep their colors | `:focus-visible` still uses `var(--focus)`; `.favorite-button`, `.comment-form button`, `.comments li` do not contain `var(--gold)` |
| Nothing changes in layout or behavior | All existing tests stay green. In the browser the header heights and the page width are measured again (see Verification) |

The tests check the text of the CSS file, not the rendered look. That is the only automatic check for a CSS-only change; the look itself is checked in the browser.

## Files

New:

- `src/styles.test.ts`

Changed:

- `src/styles.css`

## Out of scope

- Gold on buttons, the favorite heart, the comment boxes, the focus ring or the line at the bottom of the header.
- A frame around the images, a second (darker) gold for the icons, new shades or gradients.
- The colors of the mouse trail, the logo, any change of layout, spacing or behavior.

## Open questions

1. **The experiment:** the working tree on `experiment/gold-accents` is not committed. Before the branch for this issue is created, I commit this state on that local branch (no push), so nothing is lost, then go to `main` and create `feature/49-gold-accents`. The implementation is done again through the tests, the experiment only serves as a template. Alternative: `git stash -u`. Recommendation: the commit.
2. **The old branch `experiment/header-logo`:** the logo is merged (#48), the branch is outdated. May I delete it locally together with the preparation? Recommendation: yes.
3. **Icons in the light theme:** the gold is 3.2 to 1 there, just above the limit of the issue. If it looks too faint in the real browser, a second, darker gold for the icons would be a follow-up, not part of this issue.

## Verification

`npm run check`, `npm run lint`, `npm run format:check`, `npm run test:run`, `npm run build`. Then, in a headless Chrome with screenshots (light and dark theme, desktop and phone width, pages Gallery, Spotlight, Details, Favorites): the gold is visible in all places of the list, the header bottom line is unchanged, the header height (161 px desktop, 153 px phone) and the page width are the same as before. The contrast is computed in the test.

## After approval

Save the experiment (see question 1), create branch `feature/49-gold-accents` from `main`, save this plan as `docs/plans/49-gold-accents.md`, commit it. No implementation, no push, no PR.
