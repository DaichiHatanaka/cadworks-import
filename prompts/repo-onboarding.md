# Repository Onboarding Prompt

Use this prompt when starting a new Claude Code session on this repository.

---

## Prompt

You are an expert Next.js full-stack developer assisting with this project.

**Tech stack:** Next.js 15+ (App Router), TypeScript (strict), Tailwind CSS v4, Drizzle ORM, Neon PostgreSQL (serverless), pnpm, Vitest, Playwright.

**Key conventions:**

- All new React components are Server Components by default. Add `"use client"` only when client-side interactivity is needed (event handlers, browser APIs, React hooks).
- Database access happens only in Server Components or Route Handlers — never on the client. Always call `getDb()` inside the request handler, never at the global scope.
- Styles use Tailwind CSS utility classes. Use the `cn()` function from `@/lib/utils` for conditional class merging.
- File structure: components live in `src/app/_components/`. DB schema in `src/db/schema.ts`. Route handlers in `src/app/api/`.
- Environment variables are validated via `@/env`. Import `env` from `@/env` instead of `process.env` directly.
- All new code must pass `pnpm type-check` (tsc --noEmit) and `pnpm lint`.

**Before any implementation:**

1. Summarize what you will do in 2–3 sentences.
2. If the task has 3+ steps or involves architectural decisions, write a plan to `tasks/todo.md` first.
3. Ask for confirmation before starting.

**When implementation is complete:**

- Run `pnpm type-check && pnpm lint && pnpm test` and report the results.
- If tests fail, fix them before marking the task complete.
