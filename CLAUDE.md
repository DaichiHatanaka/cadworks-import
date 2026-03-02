# プロジェクト概要

Next.js + Neon (PostgreSQL) + Vercel を使ったフルスタック Web アプリケーション。
Claude Code による AI 駆動開発を前提とした構成になっている。

## 技術スタック

| カテゴリ             | 技術                             |
| -------------------- | -------------------------------- |
| フレームワーク       | Next.js 15 (App Router)          |
| 言語                 | TypeScript                       |
| スタイリング         | Tailwind CSS v4                  |
| データベース         | Neon (PostgreSQL / サーバーレス) |
| ORM                  | Drizzle ORM                      |
| デプロイ             | Vercel                           |
| パッケージマネージャ | pnpm                             |

## 主要コマンド

```bash
pnpm dev              # 開発サーバー起動 (http://localhost:3000)
pnpm build            # プロダクションビルド
pnpm lint             # ESLint チェック
pnpm type-check       # TypeScript 型チェック (tsc --noEmit)

# DB マイグレーション
pnpm drizzle-kit generate   # マイグレーションファイル生成
pnpm drizzle-kit migrate    # マイグレーション実行
pnpm drizzle-kit studio     # DB GUI ブラウザで開く

# Vercel
vercel                # プレビューデプロイ
vercel --prod         # プロダクションデプロイ
vercel env pull .env.local  # 環境変数を取得
```

## ディレクトリ構造

```
src/
├── app/              # App Router ページ・レイアウト
│   ├── layout.tsx    # ルートレイアウト
│   ├── page.tsx      # トップページ
│   └── globals.css   # グローバルスタイル
├── db/
│   ├── index.ts      # DB 接続 (getDb 関数)
│   └── schema.ts     # Drizzle スキーマ定義
└── lib/
    └── utils.ts      # cn() などの共通ユーティリティ
```

## コーディング規約

- コンポーネントは `src/app/` 配下の `_components/` に配置
- Server Component をデフォルトとし、インタラクションが必要な場合のみ `"use client"` を追加
- DB アクセスは Server Component または Route Handler 内で行う
- スタイルは Tailwind CSS のユーティリティクラスを使用。`cn()` で条件付きクラスを結合する
- 環境変数は `process.env.XXX` で参照。クライアントに公開する変数のみ `NEXT_PUBLIC_` プレフィックスを付ける

## Drizzle / Neon の注意点

```typescript
// ✅ 正しい: リクエストハンドラ内で getDb() を呼ぶ
export async function GET() {
  const db = getDb();
  const result = await db.select().from(posts);
  return Response.json(result);
}

// ❌ 誤り: グローバルスコープに DB インスタンスを保持しない
const db = getDb(); // これはやらない
```

Neon サーバーレスはリクエスト間でコネクションを維持できないため、
`getDb()` は必ず各リクエストハンドラ内で呼び出すこと。

## MCP サーバー設定

このプロジェクトは `.mcp.json` にプロジェクト固有の MCP サーバーを定義している。

| MCP        | 用途                              |
| ---------- | --------------------------------- |
| neon       | DB 管理・クエリ実行・ブランチ操作 |
| vercel     | デプロイ管理・環境変数設定        |
| github     | PR/Issue 管理・ブランチ操作       |
| context7   | ライブラリの最新ドキュメント参照  |
| playwright | E2E テスト・ブラウザ確認          |

### 初回セットアップ

**1. Neon MCP**

```bash
# Neon Console → Account Settings → API Keys からキーを取得
# .env.local に追記:
NEON_API_KEY=your_neon_api_key
```

**2. Vercel MCP**

```bash
# Claude Code で初回 OAuth 認証:
claude mcp add --transport http vercel https://mcp.vercel.com
```

**3. GitHub MCP**

GitHub の MCP は OAuth 経由。Claude Code の設定から GitHub アカウントと連携する。

## Vercel + Neon セットアップ手順

1. [Neon Console](https://console.neon.tech) でプロジェクト作成
2. Neon Console → Integrations → Vercel で連携設定
3. Vercel プロジェクトと紐付けると `DATABASE_URL` が自動設定される
4. ローカル開発用に `vercel env pull .env.local` を実行

## Claude Code プラグインのセットアップ

Claude Code プラグインはユーザーグローバルにインストールされるため、リポジトリには含まれない。
新しい環境でセットアップする際は以下を実行すること。

```bash
# Frontend & UI
npx claude-plugins install @anthropics/claude-code-plugins/frontend-design

# Feature development workflow
npx claude-plugins install @anthropics/claude-code-plugins/feature-dev

# Code review
npx claude-plugins install @anthropics/claude-code-plugins/code-review

# PR review toolkit
npx claude-plugins install @anthropics/claude-code-plugins/pr-review-toolkit

# Backend development
npx claude-plugins install @anthropics/claude-code-workflows/backend-development

# Database design
npx claude-plugins install @anthropics/claude-code-workflows/database-design

# Context management
npx claude-plugins install @anthropics/claude-code-workflows/context-management

# Frontend excellence (React, CSS, state management)
npx claude-plugins install @dotclaude/dotclaude-plugins/frontend-excellence

# Commit commands
npx claude-plugins install @anthropics/claude-code-plugins/commit-commands

# Security guidance
npx claude-plugins install @anthropics/claude-code-plugins/security-guidance

# JavaScript / TypeScript
npx claude-plugins install @anthropics/claude-code-workflows/javascript-typescript

# CLAUDE.md management (project-scoped)
npx claude-plugins install @anthropics/claude-plugins-official/claude-md-management
```

## GitHub テンプレートとして使う

このリポジトリは GitHub Template Repository として設定されている。
新しいプロジェクトを始める場合:

1. GitHub の「Use this template」ボタンから新規リポジトリ作成
2. ローカルに clone
3. `.env.local` を `.env.example` を参考に作成
4. Neon と Vercel を連携してデプロイ
5. 上記の Claude Code プラグインをインストール

## Workflow Orchestration

### 1. Plan Node Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately – don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes – don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests – then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
