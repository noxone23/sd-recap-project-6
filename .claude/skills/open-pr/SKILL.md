---
name: open-pr
description: Check, commit, push and open a pull request for an issue.
argument-hint: <issue number>
disable-model-invocation: true
---

Open the pull request for issue #$ARGUMENTS.

1. Check the current branch. If it is `main`, stop and tell me.
2. Run all checks from the Commands section of `CLAUDE.md`. If a check fails, stop and report it.
3. Commit the changes in small steps with clear messages, then push the branch.
4. Read the issue with `gh issue view $ARGUMENTS`, then create the pull request with `gh pr create`. The description contains:
   - `Closes #$ARGUMENTS`
   - a summary of the change
   - a section "How I tested" with the checks you ran and their results
   - the acceptance criteria of the issue as a checklist, ticked only where a test or check proves it

Claim nothing you did not check. If you did not run something, say so in the description.
