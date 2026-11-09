# Plan for issue 2: Setup - CI Pipeline

Issue: https://github.com/noxone23/sd-recap-project-6/issues/2

## Tests

A workflow has no unit tests, so TDD does not apply. Each acceptance criterion is verified like this:

| Acceptance criterion                                                                                    | Verification                                                                                                                       |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml` runs on every pull request and on every push to `main`.                     | Triggers `pull_request` and `push` on `main`. The run shows up in the pull request.                                                |
| A job `ci` runs `npm ci`, `npm run check`, `npm run lint`, `npm run test:run` and `npm run build`.      | The same five commands run locally one after another without errors. Read the YAML: job name `ci`, the five steps in this order.   |
| The check `ci` is green in the pull request of this issue.                                              | After pushing, `gh pr checks` shows the job `ci` as successful.                                                                    |

## Files

- New: `.github/workflows/ci.yml`
  - Triggers: `pull_request` and `push` on `main`.
  - `permissions: contents: read`.
  - Job `ci` on `ubuntu-latest`.
  - Steps: `actions/checkout@v4`, `actions/setup-node@v4` (Node 22, `cache: npm`), `npm ci`, `npm run check`, `npm run lint`, `npm run test:run`, `npm run build`.
- New: `docs/plans/2-setup-ci-pipeline.md` (this plan).
- Nothing else changes.

## Out of scope

- SonarQube, `SONAR_TOKEN` and branch protection (issue 3).
- `.github/workflows/build.yml` stays unchanged.
- No deployment steps.
- No `format:check` and no coverage run in the job: the issue lists exactly five commands.
- No Node version matrix.

## Decisions (open questions, answered)

1. `format:check` is not part of the job: implement exactly what the issue asks for.
2. Node version `22` (latest 22.x).
3. Actions are pinned by version tag (`@v4`), like in `build.yml`.
