# Plan: Replace aria-hidden by inert on the Mouse Trail Canvas (issue #41, board 21)

## Context

SonarQube Cloud reports `typescript:S6825` ("Focusable elements should not have aria-hidden") on `src/components/MouseTrail.tsx` line 155, where the decorative canvas has `aria-hidden="true"`. The canvas cannot be focused today (no `tabIndex`, `pointer-events: none`), but the attribute does not guarantee it. `inert` makes an element unfocusable and removes it from the accessibility tree in one step, so the canvas stays hidden and unfocusable even if a `tabIndex` is added later.

Findings from the code:

- `aria-hidden` on the canvas appears in exactly three places: `MouseTrail.tsx` line 155, `MouseTrail.test.tsx` line 127 and `App.test.tsx` line 1265.
- Other `aria-hidden` attributes are on SVG icons (`FavoriteButton`, `BackToTop`, `ThemeToggle`, `SearchField`). They are not focusable and not reported.
- `@types/react` 19.3.0 knows `inert?: boolean`. React 19.3.1 renders `<canvas inert>` as `<canvas inert="">` (checked with `renderToStaticMarkup`).
- The pointer listener is on `window` and the canvas already has `pointer-events: none`, so `inert` does not change how the trail receives events.

## Tests (each written first, must fail for the right reason)

| Acceptance criterion | Test |
|---|---|
| The canvas has `inert` and no `aria-hidden` | `MouseTrail.test.tsx`: the test "renders a canvas that is hidden from screen readers and cannot be focused" expects `inert` instead of `aria-hidden="true"`, plus `not.toHaveAttribute("aria-hidden")` |
| No `tabindex`, hidden and not focusable | same test (`not.toHaveAttribute("tabindex")` stays) |
| The trail works as before | All other `MouseTrail` tests stay unchanged and green. The browser check is done by the user |
| Only tests with the old attribute are adjusted | `App.test.tsx` line 1265: `toHaveAttribute("inert")` instead of `aria-hidden`. No other test file changes |
| Sonar no longer reports S6825 on `main`, quality gate green | Not testable here. The user checks the dashboard after the merge |

## Files

- `src/components/MouseTrail.tsx`: replace `aria-hidden="true"` by `inert`.
- `src/components/MouseTrail.test.tsx`: one assertion (see above).
- `src/App.test.tsx`: one assertion (see above). The test name "shows exactly one hidden canvas on the route %s" stays, because `inert` also hides the canvas.

## Out of scope

- The `aria-hidden` attributes on the SVG icons.
- CSS, other components, and the Sonar or ESLint configuration.
- Marking the finding in the Sonar dashboard.

## Decisions (approved with the plan)

1. The test name in `App.test.tsx` stays; only the assertion changes.
2. Branch `feature/41-replace-aria-hidden-by-inert` and this file, with the GitHub number 41 as given to `/plan-feature`.
3. If Sonar still reports a finding after the merge, the rule is not turned off. The finding is marked in the dashboard with a reason.

It cannot be checked beforehand whether Sonar accepts `inert` without a new finding. That only shows after the scan.

## Verification

- `npm run check`, `npm run lint`, `npm run format:check` (CRLF noise locally, CI decides), `npm run test:run`, `npm run build`.
- Each changed assertion fails first for the right reason, then passes.
- By hand with `npm run dev`: the trail still draws behind the mouse; clicks, hovering, selecting text, scrolling and focus work as before.
- After the merge: Sonar dashboard for `main`.
