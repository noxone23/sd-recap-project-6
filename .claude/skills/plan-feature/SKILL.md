---
name: plan-feature
description: Plan a feature from a GitHub issue in Plan mode, without writing application code. After approval, create the branch, save the plan and commit it.
argument-hint: <issue number>
disable-model-invocation: true
---

Plan the feature for issue #$ARGUMENTS.

## Step 1: Plan (Plan mode)

Work in Plan mode. Do not write any application code.

1. Read the issue with `gh issue view $ARGUMENTS`.
2. Explore the code that matters for this issue.
3. Present a plan with these parts:
   - **Tests:** which test covers which acceptance criterion.
   - **Files:** which files change or are created.
   - **Out of scope:** what this issue does not include.
   - **Open questions:** everything you need me to decide.

Wait for my approval. Do not continue before I approved the plan.

## Step 2: After approval

Do exactly these three things, then stop:

1. Create the branch `feature/$ARGUMENTS-<slug>`. The slug is a short kebab-case summary of the issue title.
2. Save the approved plan as `docs/plans/$ARGUMENTS-<slug>.md`.
3. Commit the plan file with a clear commit message.

Do not implement anything, do not push, and do not open a pull request.
