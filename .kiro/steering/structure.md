# Project Structure

## Organization Philosophy

App Router 規約に沿ったフラット構成。ルートが自身のプライベートコンポーネントを所有。
共有ユーティリティは `src/lib/`、DB 層は `src/db/` に完全分離、環境設定は `src/env.ts` に集約。

## Directory Patterns

### App Router ページ

**Location**: `src/app/`
**Purpose**: ページ、レイアウト、Route Handler
**Example**: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/api/*/route.ts`

### ルートスコープコンポーネント

**Location**: `src/app/_components/`
**Purpose**: 各ルート固有のプライベートコンポーネント（アンダースコアプレフィックスでルート対象外）
**Example**: `src/app/_components/LinkTable.tsx`

### DB 層

**Location**: `src/db/`
**Purpose**: `getDb()` ファクトリ（Neon + Drizzle セットアップ）とスキーマ定義
**Example**: `src/db/index.ts`（接続）, `src/db/schema.ts`（テーブル定義）

### ユーティリティ

**Location**: `src/lib/`
**Purpose**: `cn()` など共有ユーティリティ関数
**Example**: `src/lib/utils.ts`

### 環境変数設定

**Location**: `src/env.ts`
**Purpose**: `@t3-oss/env-nextjs` + Zod による型安全な環境変数定義・バリデーション

### テスト

**Location**: `src/test/`（セットアップ）, `src/**/*.test.ts`（ユニット）, `e2e/`（E2E）
**Purpose**: Vitest ユニットテスト + Playwright E2E テスト

### マイグレーション

**Location**: `migrations/`
**Purpose**: Drizzle Kit が生成するマイグレーションファイル（手動編集しない）

### ドキュメント

**Location**: `docs/`
**Purpose**: 要件定義書・UIUX 設計書など製品ドキュメント

## Naming Conventions

- **ルートファイル**: Next.js 規約（`page.tsx`, `layout.tsx`, `route.ts`）
- **コンポーネント**: `PascalCase.tsx`
- **ユーティリティ**: `camelCase.ts`
- **テストファイル**: ソースと同一階層に `.test.ts` / `.spec.ts`
- **E2E テスト**: `e2e/*.spec.ts`
- **プライベートディレクトリ**: `_` プレフィックス（`_components/`）

## Import Organization

```typescript
// 絶対インポート（クロスモジュール参照で優先）
import { cn } from "@/lib/utils";
import { getDb } from "@/db";
import { env } from "@/env";

// 相対インポート（同一ディレクトリ・同一フィーチャー内）
import "./globals.css";
```

**Path Aliases**:

- `@/` → `./src/`（tsconfig `paths` + vitest `resolve.alias` で統一）

## Code Organization Principles

### レンダリングモデル

- デフォルト: Server Component（ディレクティブ不要）
- クライアントインタラクション必要時のみ `"use client"` を追加
- DB アクセス: Server Component または `src/app/api/` Route Handler 内のみ

### スタイリングパターン

- Tailwind v4: `globals.css` で `@import "tailwindcss"` + `@theme inline` でデザイントークン
- CSS カスタムプロパティ: `--background`, `--foreground` 等のテーマトークン
- ダークモード: `@media (prefers-color-scheme: dark)` でシステム設定準拠
- 条件付きクラス合成: 常に `cn()` を使用（`clsx` + `tailwind-merge`）
- フォント: Geist Sans + Geist Mono を `next/font/google` で読み込み、CSS 変数注入

### ドメイン UI カラーパレット

- 不一致ハイライト: `#FFA500`（オレンジ背景）
- 未保存バッジ: `#FFC107`（黄）
- 保存済バッジ: `#4CAF50`（緑）
- T-BOM 不在行: `#E0E0E0`（グレー）
- テーブルヘッダー: `#1976D2`（青背景 + 白文字）
- CAD 側ラベル: `#1565C0`（濃青）
- T-BOM 側ラベル: `#00695C`（濃ティール）
- 進捗バー: 0-49% `#F44336`（赤）/ 50-89% `#FFC107`（黄）/ 90-100% `#4CAF50`（緑）

---

_Document patterns, not file trees. New files following patterns shouldn't require updates_
