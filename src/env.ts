import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables.
   * These are never exposed to the browser.
   */
  server: {
    DATABASE_URL: z.string().url().startsWith("postgresql://"),
    NEON_API_KEY: z.string().min(1).optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  /**
   * Client-side environment variables.
   * Must be prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  },

  /**
   * Destructure all variables from process.env.
   * Required when using Next.js App Router (can't use spread).
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEON_API_KEY: process.env.NEON_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  /**
   * Skip validation in CI or when env vars are not available.
   * Set SKIP_ENV_VALIDATION=1 to bypass (e.g., in CI, tests, lint).
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.npm_lifecycle_event === "lint",

  /**
   * Treat empty strings as undefined during validation.
   */
  emptyStringAsUndefined: true,
});
