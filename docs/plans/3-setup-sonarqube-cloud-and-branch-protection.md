# Plan for issue 3: Setup - SonarQube Cloud and Branch Protection

Issue: https://github.com/noxone23/sd-recap-project-6/issues/3

## Current state

- `sonar-project.properties` exists: test patterns cover `.ts` and `.tsx`, `src/index.tsx` is in `sonar.coverage.exclusions`.
- The scan workflow exists as `.github/workflows/build.yml` (coverage before the scan, `fetch-depth: 0`). The issue names it `sonar.yml`.
- The secret `SONAR_TOKEN` is set. The check "SonarQube Cloud" was green in PR #15.
- `main` has no branch protection.

## Tests

No unit tests: each acceptance criterion is verified with a real run.

| Acceptance criterion                                                          | Verification                                                                                                                  |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| SonarQube Cloud analyzes every pull request, the quality gate shows up as a check | The pull request of this issue shows the check (`gh pr checks`).                                                          |
| The coverage of the tests shows up in SonarQube Cloud                         | Read the `coverage` measure of the project in SonarQube Cloud. It stays 0 % until the project has tests.                      |
| Test files are marked as tests, not as source code                            | Read `sonar.test.inclusions` (`src/**/*.test.ts,src/**/*.test.tsx`) and check the scan log.                                   |
| `main` is protected: `ci` and the quality gate are required, no approvals     | Read the protection back with `gh api` (`required_status_checks`, no required approving reviews).                             |

## Files

- Rename `.github/workflows/build.yml` to `.github/workflows/sonar.yml` (content unchanged), like the issue says.
- `CLAUDE.md`: the CI line points to `sonar.yml`.
- New: `docs/plans/3-setup-sonarqube-cloud-and-branch-protection.md` (this plan).
- Branch protection is a repository setting, not a file.

## Out of scope

- The token and the SonarQube organization (already done, the token is never touched).
- `ci.yml` stays unchanged.
- No tests only to raise the coverage.
- No changes to Sonar rules or to the quality gate.

## Decisions (open questions, answered)

1. Rename `build.yml` to `sonar.yml`, because the issue names it so.
2. Branch protection is set up with `gh api`, after the workflows of issues 2 and 3 ran at least once (the issue says so).
3. Required checks: `ci` and the SonarQube Cloud check (name taken from the check list after the rename). No required approvals, because nobody can approve their own pull request.
4. Order: merge the pull request first, then set the protection, so the pull request does not wait for a check that never ran.
