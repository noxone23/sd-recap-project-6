# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Art Gallery app (Recap Project 6): Vite, React 19, TypeScript, React Router and SWR. Tests with Vitest, jsdom and React Testing Library. Pages: Spotlight, Gallery, Favorites, Details. Art data comes from `https://example-apis.vercel.app/api/art`. Node.js 22.22 or newer.

## Commands

- `npm run dev`: dev server on port 3000
- `npm run build`: production build
- `npm run check`: type-check (`tsc --noEmit`)
- `npm run lint`: ESLint (flat config in `eslint.config.js`, with `sonarjs`)
- `npm run format`: format with Prettier
- `npm run format:check`: check the formatting
- `npm run test:run`: run all tests once
- `npm run test:run -- src/path/File.test.tsx`: run a single test file (add `-t "name"` for one test)
- `npm run coverage`: tests with coverage, writes `coverage/lcov.info` for SonarQube Cloud

Before a pull request, all of these must pass: `check`, `lint`, `format:check`, `test:run`, `build`.

## Conventions

- `src/index.tsx` wraps `App` in `BrowserRouter`; routes and pages go in `App`.
- Test setup lives in the `test` block of `vite.config.ts` (jsdom, globals, `src/setupTests.ts` with jest-dom). Coverage settings are in the same block.
- Test files are `*.test.ts` / `*.test.tsx` next to the source. Patterns must cover `.ts` and `.tsx`.
- `vercel.json` rewrites all URLs to `index.html` so deep links like `/art-pieces/<slug>` work.
- One feature branch and one pull request per issue. Skills in `.claude/skills/` (`plan-feature`, `tdd-feature`, `open-pr`, `create-issue`) guide the workflow; plans are saved in `docs/plans/<n>-<slug>.md`.
- CI: `.github/workflows/sonar.yml` runs coverage and the SonarQube Cloud scan (secret `SONAR_TOKEN`, config in `sonar-project.properties`).
- The `reviewer` agent in `.claude/agents/` reviews the branch with `git diff main...HEAD` and never edits files.

## Off limits

- Never use `npm test`: it starts the watch mode. Use `npm run test:run`.
- Never change a test to make it pass. Fix the code instead.
- Never lower a threshold or disable a rule to make a check green.
- Only do what the current issue asks for.
- Do not create a `vitest.config.ts`: it would override `vite.config.ts`.
- Do not edit `.github/workflows/create-issues.yml` or `.github/templates/`.
- Never read `.env` files or secrets. See `docs/agent-security.md`.
