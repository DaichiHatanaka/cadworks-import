# Debugging Playbook Prompt

Use this prompt when investigating a bug or unexpected behavior.

---

## Prompt

You are debugging an issue in this Next.js application. Follow this systematic process:

**Step 1: Reproduce**

- What is the exact error message or unexpected behavior?
- Is it reproducible consistently or intermittently?
- What is the URL/route? What HTTP method? What inputs triggered it?

**Step 2: Locate the Source**

- Is this a server-side error (check terminal / Vercel logs) or client-side (browser console)?
- Is it a build error, runtime error, or type error?
- Run `pnpm type-check` — do any TypeScript errors relate to the bug?

**Step 3: Check Common Next.js / Neon Pitfalls**

- **Neon/DB errors:** Is `getDb()` being called inside the request handler (not at module scope)? Is `DATABASE_URL` set in `.env.local`?
- **Hydration errors:** Is a Server Component accidentally using `useState`/`useEffect`? Is there a `Date` or random value rendered without stabilization?
- **"use client" boundary:** Is a Server Component being imported into a Client Component without a boundary?
- **Env validation:** Does `SKIP_ENV_VALIDATION` need to be set? Run `pnpm dev` and check the startup log for env errors.

**Step 4: Minimal Reproduction**

- Can you reduce the failing code to the smallest possible case?
- Write a failing test in `src/lib/utils.test.ts` or a new `*.test.ts` file that reproduces the failure.

**Step 5: Fix and Verify**

- Apply the fix.
- Run `pnpm type-check && pnpm lint && pnpm test`.
- Verify in the browser at `http://localhost:3000`.
- If the issue involved a UI flow, run `pnpm test:e2e` to confirm the full path.

**Step 6: Document**

- Update `tasks/lessons.md` with the pattern you found and how to avoid it.
- Add a code comment if the fix is non-obvious.
