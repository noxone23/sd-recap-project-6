---
name: create-issue
description: Turn an idea into a GitHub issue in the format of the template issues. Shows a draft first.
argument-hint: <your idea>
disable-model-invocation: true
---

Turn this idea into a GitHub issue: $ARGUMENTS

1. Look at the issue templates in `.github/templates/` and use the same format:
   - a title
   - **Value Proposition** (**As a** … **I want to** … **so that** …)
   - **Acceptance Criteria** as a checklist
   - **Tasks** as a checklist
2. Show me the draft and wait. Change it as I ask.
3. Only after I agreed, run `gh issue create` with the title and the body. Report the URL of the new issue.

Do not run `gh issue create` before I agreed.
