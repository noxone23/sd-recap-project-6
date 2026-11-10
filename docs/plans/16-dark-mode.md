# Plan: Issue 16 – Dark Mode (GitHub #31)

## Context
The app has a light glass design (issue 15). Issue 16 adds a button in the header that switches between a light and a dark color scheme. At the start the setting of the operating system is used; afterwards the choice of the user, which is kept after a reload. Most colors are already CSS variables on `:root`, so the dark mode mostly redefines them.

## Design
- **`src/theme.ts`** (new, plain module next to `artPieceInfoStorage.ts`): `type Theme = "light" | "dark"`, `loadTheme(): Theme | null` (reads `"light"` or `"dark"` from the local storage, `null` for nothing or anything else, also when the storage throws), `saveTheme(theme)` (ignores errors, like `saveArtPiecesInfo`), `getInitialTheme(): Theme` (saved choice, else the system setting from `window.matchMedia?.("(prefers-color-scheme: dark)")`, else `"light"`). The call to `matchMedia` is guarded because jsdom has no `matchMedia` and no existing test may break.
- **`src/components/ThemeToggle.tsx`** (new): props `theme`, `onToggle`. A `<button type="button" className="theme-toggle">` with a lucide-react icon (`Moon` in light mode, `Sun` in dark mode, `aria-hidden`). The label says what a click does: "Switch to dark mode" / "Switch to light mode". The state is told by the label (no `aria-pressed` in addition, a changing label plus `aria-pressed` would be read twice).
- **`src/App.tsx`**: `const [theme, setTheme] = useState<Theme>(getInitialTheme)`; an effect sets `document.documentElement.dataset.theme = theme` and calls `saveTheme(theme)`; the header becomes `<header><h1>Art Gallery</h1><ThemeToggle .../><Navigation /></header>`. The toggle is outside `<nav>`, so there is still exactly one `navigation`. The DOM order equals the visual order (title, toggle, navigation).
- **`src/styles.css`**:
  - Light values stay in `:root`. Dark values are defined for `:root[data-theme="dark"]` and, as the start value before React sets the attribute, for `@media (prefers-color-scheme: dark)` on `:root:not([data-theme="light"])` (this avoids a light flash for dark-system users). The two blocks hold the same variables.
  - New variables for every hard-coded color found: the body gradient (two radial colors and two linear colors), the two header blobs (four colors), scrollbar thumb and track, `::selection`, the small shadows, hover backgrounds (`#fff`), the palette border and the button colors (`#fff`, `#353b42`).
  - `color-scheme: light` / `dark` per theme, so native controls and the scrollbar follow.
  - The `@supports not (backdrop-filter)` fallback also gets dark values (`--glass`, `--glass-strong`, `--inset`), otherwise it stays white in dark mode.
  - `.theme-toggle` is styled like the favorite button (round glass button, hover, focus ring). Header layout: title on the left, toggle and navigation on the right; on a phone the toggle stays in the first row next to the title and the navigation wraps to the second row.
- **Dark palette (to be checked and adjusted by contrast):** dark blue-violet gradient background, dark translucent glass, light ink `#e9edf2`, muted `#aab2bd`, light edges, accent `#ff7a9c`, focus `#7aa2ff`, softer blobs. Every text, border, heart and focus pair is calculated like in issue 15 (text 4.5 or more, borders and focus 3 or more).

## Tests (per acceptance criterion)
Written first, one at a time, each seen failing for the right reason.
| Acceptance criterion | Test |
|---|---|
| Button next to the navigation, label says what a click does | `ThemeToggle.test.tsx`: label "Switch to dark mode" in light and "Switch to light mode" in dark, click calls `onToggle`; `App.test.tsx`: the header contains the button and the click flips the label |
| Keyboard use, state for screen readers | `ThemeToggle.test.tsx`: focus with Tab, toggle with Enter and Space; the accessible name changes with the state |
| System setting at the start | `theme.test.ts`: `matchMedia` mocked to dark gives `"dark"`, to light gives `"light"`; `App.test.tsx`: `data-theme` on `<html>` is `dark` with a dark system setting |
| Colors change on all pages | `App.test.tsx`: clicking the toggle changes `data-theme` on `<html>` (the colors themselves are checked in the browser, see below) |
| Contrast in both modes | Calculated for all pairs of both modes plus screenshots of all pages in both modes (not a jsdom test) |
| Choice kept after reload | `theme.test.ts`: round trip of `saveTheme` and `loadTheme`; `App.test.tsx`: a saved `dark` is used although the system says light, and a click saves the new choice |
| Works without a saved choice and with blocked storage | `theme.test.ts`: nothing saved, an invalid value, `getItem` throws, `setItem` throws, `matchMedia` missing; `App.test.tsx`: the app renders and toggles with a throwing storage |
| Existing tests pass, favorites and comments not affected | All existing tests unchanged; separate storage key (`theme`), a test that toggling does not change `art-pieces-info` |

## Files
- Create: `src/theme.ts`, `src/theme.test.ts`, `src/components/ThemeToggle.tsx`, `src/components/ThemeToggle.test.tsx`
- Modify: `src/App.tsx` (state, effect, header), `src/App.test.tsx` (new tests only), `src/styles.css`
- Create: `docs/plans/16-dark-mode.md` (this plan)

## Out of scope
- Following later changes of the system setting while the page is open.
- A third "system" choice, an animated change between the modes, a `theme-color` meta tag.
- Changing existing tests, `Navigation`, `FavoriteButton` or the data and storage of favorites and comments.
- The particles that follow the mouse, the "back to top" button and the search in the header (own issues).

## Notes and risks
- jsdom has no `matchMedia`, so `getInitialTheme` must not call it unguarded. Tests that need it mock it with `vi.stubGlobal` and unstub afterwards.
- The accessible name of the toggle must not contain "Favorite": `App.test.tsx` counts buttons by `/Favorite/`.
- A user whose saved choice differs from the system setting can see a short flash of the other theme before React sets the attribute. An inline script in `index.html` could prevent it; it is not part of this plan because its logic would duplicate `theme.ts` and cannot be tested here.
- The heart color, the palette borders and the shadows need dark variants, otherwise they look wrong in dark mode.

## Open questions
Decided: the toggle is a round Sun/Moon icon button (lucide-react, already installed), the label says what a click does. Open: none.

## Verification
`npm run check`, `lint`, `format:check`, `test:run`, `build` green; `npm run coverage` covers the new files; contrast calculated for the dark colors; screenshots of Spotlight, Gallery, Details, Favorites, error page and "Page not found" in both modes and on a phone width; a real click on the toggle and a reload in Chrome.
