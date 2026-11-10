# Plan: Issue 18 – Back to Top Button (GitHub #35)

## Context
On long pages (the Gallery, a Details page with many comments) the user has to scroll a long way back to the header with the search and the navigation. Issue 18 adds a round glass button in the bottom right corner. It appears after scrolling down more than 400 px, scrolls to the top on a click, and moves the keyboard focus to the page title, so a keyboard user does not lose the place when the button disappears at the top.

## Design
- **`src/components/BackToTop.tsx`** (new). Props: `onClick: () => void`. Own state `isScrolled`, a boolean: initially `window.scrollY > 400` (so it is right after a reload that restores the scroll position), updated in an effect with a `scroll` listener on `window` (`{ passive: true }`, removed on cleanup). The state is a boolean, so React only re-renders when it changes. While `isScrolled` is false it renders `null`, so the button is not in the page, cannot be focused and is not read by screen readers. Otherwise: `<button type="button" className="back-to-top" aria-label="Back to top" onClick={onClick}><ArrowUp aria-hidden="true" /></button>` (icon from `lucide-react`, already installed; the same pattern as `ThemeToggle`).
- **`src/App.tsx`**:
  - `const titleRef = useRef<HTMLHeadingElement>(null)`; the title becomes `<h1 ref={titleRef} tabIndex={-1}>Art Gallery</h1>` (focusable by script, not in the tab order).
  - `function handleBackToTop() { window.scrollTo({ top: 0 }); titleRef.current?.focus({ preventScroll: true }); }`. `preventScroll` keeps the focus call from jumping and interrupting the smooth scroll.
  - `<BackToTop onClick={handleBackToTop} />` as the last element of the fragment, after `</main>`. So it is outside the header (no `overflow: hidden`, no extra `backdrop-filter` parent), last in the tab order, and the existing tab-order test is not disturbed.
  - Smooth scrolling needs no code: `html { scroll-behavior: smooth }` is already in the CSS for users without reduced motion, and `scrollTo` follows it. With reduced motion the page jumps without animation.
- **`src/styles.css`**:
  - `.back-to-top`: `position: fixed`, `right: max(1.25rem, env(safe-area-inset-right))`, `bottom: max(1.25rem, env(safe-area-inset-bottom))`, `z-index: 20` (the header has 10), the size and the glass look of `.theme-toggle` (round, `--glass-strong`, `--glass-edge`, `--shadow-heart`, `:hover` with `--solid-hover`, the same transition). `.back-to-top` is added to the `backdrop-filter` list. All values are existing variables, so the dark theme follows without new colors.
  - Focus: the global `:focus-visible` ring is used. The title gets the ring only when the browser decides that a focus ring is wanted (after a keyboard click); I check it in Chrome.
  - The phone: the same size as the theme toggle on a phone; it stays in the corner and inside the safe area. The `viewport` meta of `index.html` is not changed.

## Tests (per acceptance criterion)
Written first, one at a time, each seen failing for the right reason. jsdom does not scroll: `scrollY` is set with `Object.defineProperty(window, "scrollY", { configurable: true, value })` and a `scroll` event is fired with `fireEvent.scroll(window)`; `scrollTo` is replaced with `vi.stubGlobal("scrollTo", vi.fn())`; `afterEach` resets `scrollY` to 0 and unstubs.

| Acceptance criterion | Test |
|---|---|
| Round button "Back to top", fixed bottom right | `BackToTop.test.tsx`: a button named "Back to top" is shown when scrolled; the icon is hidden from screen readers. Position and look: Chrome check (CSS) |
| Hidden at the top (not shown, not focusable, not read) | `BackToTop.test.tsx`: at `scrollY` 0 there is no button in the document; `App.test.tsx`: no "Back to top" button at the start |
| Appears after 400 px, disappears again at the top | `BackToTop.test.tsx`: 400 px: hidden, 401 px: shown; scrolling back to 0 hides it; mounted with `scrollY` already 500: shown at once |
| Click scrolls to the top, smooth or instant | `App.test.tsx`: a click calls `window.scrollTo` with `top: 0`; smooth vs instant is the existing CSS (`scroll-behavior`), checked in Chrome with and without reduced motion |
| Focus moves to the page title | `App.test.tsx`: after the click the heading "Art Gallery" has focus; the heading has `tabindex="-1"` |
| Keyboard use, visible focus | `BackToTop.test.tsx`: Tab reaches the button, Enter and Space call `onClick`; Chrome: the focus ring on the button |
| Works on all pages | `App.test.tsx`: `it.each` over `/`, `/art-pieces`, `/favorites`, a details page and an unknown path: after a scroll event the button is there; the listener is removed on unmount (`BackToTop.test.tsx`) |
| Same look as the other round glass buttons, both themes, phone | Chrome: screenshots on a desktop and a phone width in the light and the dark theme (CSS) |
| Only affected tests change, checks pass | No existing test is expected to change (the button is not in the page while `scrollY` is 0, and the title only gets `tabindex="-1"`); `check`, `lint`, `format:check`, `test:run`, `build` |

## Files
- Create: `src/components/BackToTop.tsx`, `src/components/BackToTop.test.tsx`, `docs/plans/18-back-to-top-button.md` (this plan)
- Modify: `src/App.tsx` (the ref, the handler, the button, `tabIndex` on the title), `src/App.test.tsx` (new tests only), `src/styles.css`
- Not changed: `index.html`, `ThemeToggle`, `Navigation`, `SearchField`, the header layout

## Out of scope
- An animation for the appearing and disappearing, a different threshold than 400 px, a setting for it, scrolling to anchors, a keyboard shortcut (the Home key does it natively).
- Throttling the scroll event (the state is a boolean, so the re-render happens only when it changes).
- Changes to existing tests, the header, the viewport meta, or other pages.

## Risks and checks
- **Focus ring on the title** after a click: the global ring might look odd on a heading. It is looked at in Chrome; if needed, a rule for `h1:focus-visible` is added, and I tell you before.
- **Smooth scroll and the focus call:** `focus()` without `preventScroll` would jump to the title at once; that is why `preventScroll: true` is used. Checked in Chrome that the scroll stays smooth.
- **The button over content:** it can cover a favorite button or text in the corner while it is shown. That is normal for this pattern; checked on a phone width.

## Open questions
None. Decided in the issue: 400 px, the focus moves to the title, the existing CSS makes the scroll smooth.

## Verification
`npm run check`, `lint`, `format:check`, `test:run`, `build` green; `npm run coverage` covers the new files; in Chrome (script with real input): scroll the Gallery and a Details page, the button appears and disappears, a click scrolls to the top and the title has the focus, the keyboard (Tab, Enter, Space), reduced motion, screenshots light and dark on a desktop and a phone width.
