---
name: tdd-feature
description: Implement an approved plan with test-driven development, one acceptance criterion at a time.
argument-hint: <plan file>
disable-model-invocation: true
---

Implement the approved plan in `$ARGUMENTS`.

Read the plan first. Work through the acceptance criteria one at a time, in the order of the plan. For each criterion:

1. Write a failing test.
2. Run the test once and check that it fails for the right reason: the feature is missing, not a typo or a broken setup. If it fails for another reason, fix the test first.
3. Write the minimal code that makes the test pass.
4. Run the test again until it passes.
5. Clean up the code and the test without changing the behavior. Run the test again.

Rules:

- Never change an existing test unless the approved plan says so.
- Do nothing that is not in the plan. If something is missing or unclear, stop and ask me.

At the end, run all checks from the Commands section of `CLAUDE.md` and fix what fails. Report the result of each check as it really was.
