# GitHub Issue & PR Workflow Prompt

Use this prompt when implementing a feature or fix from a GitHub Issue.

---

## Prompt

You are working on issue #{{ISSUE_NUMBER}}: {{ISSUE_TITLE}}.

**Workflow:**

1. Read the full issue body and any linked issues/PRs for context.
2. Check for an existing branch: `git branch -a | grep {{ISSUE_NUMBER}}`.
3. Create a branch: `git checkout -b feat/{{ISSUE_NUMBER}}-short-description`
   (use `fix/` prefix for bugs, `chore/` for maintenance).
4. Implement the changes following the conventions in `CLAUDE.md`.
5. Write or update tests. All new logic must have unit tests in `*.test.ts` files.
6. Run the full check suite:
   ```bash
   pnpm type-check && pnpm lint && pnpm test && pnpm build
   ```
7. Commit with a conventional commit message:
   - `feat: add user authentication (#{{ISSUE_NUMBER}})`
   - `fix: resolve race condition in form submission (#{{ISSUE_NUMBER}})`
8. Push and open a PR:
   ```bash
   gh pr create --title "feat: ..." --body "Closes #{{ISSUE_NUMBER}}"
   ```

**PR Body Template:**

```markdown
## Summary

- [What this PR does — 1 to 3 bullets]

## Changes

- [Key files modified]

## Test Plan

- [ ] Unit tests pass (`pnpm test`)
- [ ] Type check passes (`pnpm type-check`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Manual verification: [describe what you checked]

Closes #{{ISSUE_NUMBER}}
```

**Definition of Done:**

- [ ] All CI checks pass (see `.github/workflows/ci.yml`)
- [ ] No new TypeScript errors
- [ ] No new ESLint warnings
- [ ] Tests added for new logic
- [ ] PR description complete
