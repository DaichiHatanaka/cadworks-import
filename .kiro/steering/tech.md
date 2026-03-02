# Technology Stack

## Architecture

フルスタック Next.js App Router アプリケーション。
Server Components でデータ取得、Client Components はインタラクション時のみオプトイン。
API Route Handlers がサーバー側 DB 境界。Vercel + Neon にサーバーレスデプロイ。

## Core Technologies

| レイヤー               | 技術                         | バージョン                  |
| ---------------------- | ---------------------------- | --------------------------- |
| 言語                   | TypeScript (strict)          | ^5                          |
| フレームワーク         | Next.js (App Router)         | 16                          |
| スタイリング           | Tailwind CSS v4              | ^4                          |
| DB                     | Neon (PostgreSQL serverless) | @neondatabase/serverless ^1 |
| ORM                    | Drizzle ORM                  | ^0.45                       |
| 環境変数バリデーション | @t3-oss/env-nextjs + Zod     | —                           |
| パッケージマネージャ   | pnpm                         | —                           |
| デプロイ               | Vercel                       | —                           |

## Key Libraries

パターンに影響を与える主要ライブラリのみ:

- `clsx` + `tailwind-merge` → `cn()` ユーティリティで条件付きクラス合成
- `drizzle-kit` → スキーマからマイグレーション生成ワークフロー
- `@t3-oss/env-nextjs` + `zod` → 型安全な環境変数バリデーション（`process.env` を直接使わず `env` オブジェクトを import）

## Development Standards

### Type Safety

- `strict: true`, `noEmit: true`, `isolatedModules: true`
- パスエイリアス `@/*` → `./src/*`
- `moduleResolution: bundler`
- `tsc --noEmit` がマージ前に通ること

### Code Quality

- ESLint: `next/core-web-vitals` + `next/typescript` + `prettier`
- Prettier: `prettier-plugin-tailwindcss`（Tailwind クラス自動ソート）
- `lint-staged`: commit 時に `eslint --fix` + `prettier --write`
- Husky: `pre-commit` → lint-staged, `pre-push` → `tsc --noEmit`

### Testing

- **Unit/Integration**: Vitest ^4, jsdom 環境, `@testing-library/jest-dom`
  - テストファイル: `src/**/*.test.{ts,tsx}` / `src/**/*.spec.{ts,tsx}`
  - カバレッジ: v8 プロバイダ、`src/db/**` と `src/env.ts` は除外
  - テスト時は `SKIP_ENV_VALIDATION=1` で環境変数バリデーションをスキップ
- **E2E**: Playwright ^1.51, Chromium のみ, テスト: `./e2e/`

## Common Commands

```bash
pnpm dev              # 開発サーバー
pnpm build            # プロダクションビルド
pnpm lint             # ESLint
pnpm type-check       # tsc --noEmit
pnpm test             # Vitest
pnpm test:e2e         # Playwright
pnpm db:generate      # マイグレーション生成
pnpm db:migrate       # マイグレーション実行
pnpm db:studio        # DB GUI
```

## Key Technical Decisions

### Neon サーバーレス DB パターン

```typescript
// ✅ 正しい: リクエストハンドラ内で getDb() を呼ぶ
export async function GET() {
  const db = getDb();
  const result = await db.select().from(posts);
  return Response.json(result);
}

// ❌ 誤り: モジュールスコープで DB インスタンスを保持しない
const db = getDb(); // コネクションが維持されないため不可
```

### 環境変数バリデーション

```typescript
// ✅ 正しい: env オブジェクト経由でアクセス
import { env } from "@/env";
const url = env.DATABASE_URL;

// ❌ 誤り: process.env を直接使わない
const url = process.env.DATABASE_URL;
```

---

_Document standards and patterns, not every dependency_
