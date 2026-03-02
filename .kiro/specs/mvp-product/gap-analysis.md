# Gap Analysis: mvp-product (TBOM-611)

## 概要

本プロジェクトは**グリーンフィールド実装**である。コードベースは Next.js + Neon + Drizzle のテンプレート初期状態であり、TBOM-611 のドメイン機能はすべてゼロから構築する必要がある。ただし、インフラ（DB接続パターン、スタイリング規約、テストフレームワーク、CI hooks）は確立済みであり、これらのパターンに厳密に従って実装する。

---

## 1. 現状（再利用可能な資産）

### インフラ（確立済み）

| 資産                         | ファイル               | 概要                                                                       |
| ---------------------------- | ---------------------- | -------------------------------------------------------------------------- |
| DB接続ファクトリ             | `src/db/index.ts`      | `getDb()` — ハンドラ内で呼び出すパターン                                   |
| DBスキーマ（プレースホルダ） | `src/db/schema.ts`     | `posts` サンプルのみ。`CWX_DATA`, `TBOM_DATA`, `job_locks` に置き換え必要  |
| 環境変数バリデーション       | `src/env.ts`           | `DATABASE_URL`, `NEON_API_KEY`, `NODE_ENV`, `NEXT_PUBLIC_APP_URL` 設定済み |
| CSSデザイントークン          | `src/app/globals.css`  | Tailwind v4 + `@theme inline`。ドメインカラーは未追加                      |
| `cn()` ユーティリティ        | `src/lib/utils.ts`     | `clsx` + `tailwind-merge`                                                  |
| ルートレイアウト             | `src/app/layout.tsx`   | Geist フォント、HTML シェル                                                |
| テストセットアップ           | `src/test/setup.ts`    | Vitest + `@testing-library/jest-dom`                                       |
| E2Eフレームワーク            | `playwright.config.ts` | Chromium、`pnpm dev` 自動起動                                              |
| CI Hooks                     | `.husky/`              | pre-commit: lint-staged, pre-push: `tsc --noEmit`                          |

### インストール済み依存パッケージ

- `drizzle-orm`, `@neondatabase/serverless` — DB層
- `next` 16, `react` 19 — フレームワーク
- `tailwindcss` v4, `clsx`, `tailwind-merge` — スタイリング
- `zod` — バリデーション
- `vitest`, `@testing-library/react`, `@playwright/test` — テスト

---

## 2. 要件ごとのギャップマップ

| Req | 要件                     | 既存              | ギャップ                                                    |
| --- | ------------------------ | ----------------- | ----------------------------------------------------------- |
| 1   | 画面遷移・初期表示       | なし              | ルート、ページ、URLパラメータ受け渡し、データ取得           |
| 2   | 自動紐付けロジック       | なし              | アルゴリズム関数、APIルート、DBテーブル                     |
| 3   | 上段：未紐付け作業エリア | なし              | テーブル2つ、フィルタ、インライン展開、ソート               |
| 4   | 手動紐付け操作           | なし              | 全操作ロジック + **DnDライブラリ未導入**                    |
| 5   | 下段：ミラー比較テーブル | なし              | ミラーテーブル、差分ハイライト、フィルタ、テキスト検索      |
| 6   | 保存・破棄・終了         | なし              | APIルート、状態ロールバック、ダイアログ、**トースト未導入** |
| 7   | Excel出力                | なし              | APIルート + **Excelライブラリ未導入**                       |
| 8   | 排他制御                 | なし              | DBテーブル、ロックAPI、ロック表示、自動解放                 |
| 9   | プログレスバー           | なし              | コンポーネント、色ロジック、リアルタイム更新                |
| 10  | レスポンシブ対応         | なし              | ブレイクポイント処理、ツールチップ、1024px警告              |
| 11  | UIカラーパレット         | 一部（docs のみ） | globals.css にドメインカラー8色が未追加                     |

---

## 3. 不足しているもの（詳細）

### 3.1 DBスキーマ（Missing）

`src/db/schema.ts` に以下のテーブル定義が必要:

- **CWX_DATA**: CADWorx側の機器データ（LIST_TYPE, KID, ID_COUNT, KIKI_NO, KIKI_BAME, QTY_ORD, SHORT_SPEC, CWX_LINKED_FLG 等）
- **TBOM_DATA**: T-BOM側の原価項目データ（同上のフィールド群）
- **job_locks**: 排他制御テーブル（job_no, locked_by, locked_at, expires_at）

※ `migrations/` は空。スキーマ定義後に `pnpm db:generate` + `pnpm db:migrate` を実行。

### 3.2 APIルート（Missing）

`src/app/api/` ディレクトリ自体が存在しない。以下を新規作成:

| ルート                     | メソッド        | 用途                                       |
| -------------------------- | --------------- | ------------------------------------------ |
| `api/link/route.ts`        | GET             | CWX/TBOM データ取得 + 自動紐付け結果を返却 |
| `api/link/save/route.ts`   | POST            | 未保存レコードを DB に永続化               |
| `api/link/export/route.ts` | GET             | Excel ファイル生成・ダウンロード           |
| `api/lock/route.ts`        | POST/DELETE/GET | ロック取得・解放・状態確認                 |

### 3.3 コンポーネント（Missing）

| コンポーネント                              | Client?     | 用途                               |
| ------------------------------------------- | ----------- | ---------------------------------- |
| `linking/page.tsx`                          | No (Server) | ルートページ、初期データ取得       |
| `linking/_components/LinkingHeader.tsx`     | Yes         | タイトル、工番情報、プログレスバー |
| `linking/_components/ProgressBar.tsx`       | Yes         | 色分けプログレスバー               |
| `linking/_components/UpperPane.tsx`         | Yes         | 上段コンテナ（左＋中央＋右）       |
| `linking/_components/UnlinkedCadTable.tsx`  | Yes         | 上段左テーブル + フィルタ          |
| `linking/_components/UnlinkedTbomTable.tsx` | Yes         | 上段右テーブル + フィルタ          |
| `linking/_components/LinkingButtons.tsx`    | Yes         | 紐付け/追加/解除ボタン             |
| `linking/_components/LinkedMirrorTable.tsx` | Yes         | 下段ミラーテーブル                 |
| `linking/_components/FilterBar.tsx`         | Yes         | 下段フィルタ + テキスト検索        |
| `linking/_components/FooterActionBar.tsx`   | Yes         | Excel/破棄/保存/終了ボタン         |

### 3.4 ユーティリティ関数（Missing）

| 関数                   | ファイル                | 用途                                  |
| ---------------------- | ----------------------- | ------------------------------------- |
| 自動紐付けアルゴリズム | `src/lib/auto-link.ts`  | LIST_TYPE + KID + ID_COUNT マッチング |
| 差分チェック関数       | `src/lib/diff-check.ts` | セルレベル比較（5属性）               |

### 3.5 未導入 npm パッケージ

| パッケージ                             | 用途                        | 要件       |
| -------------------------------------- | --------------------------- | ---------- |
| `@dnd-kit/core` + `@dnd-kit/utilities` | ドラッグ＆ドロップ（Req 4） | FR-MVP-023 |
| `exceljs`                              | Excel出力（Req 7）          | FR-MVP-043 |
| `sonner`                               | トースト通知（Req 6）       | MSG-05     |

### 3.6 globals.css ドメインカラー（Missing）

`@theme inline` ブロックに以下のカラートークンを追加する必要がある:

```css
--color-diff-highlight: #ffa500;
--color-tbom-absent: #e0e0e0;
--color-badge-unsaved: #ffc107;
--color-badge-saved: #4caf50;
--color-table-header: #1976d2;
--color-cad-label: #1565c0;
--color-tbom-label: #00695c;
--color-progress-low: #f44336;
--color-progress-mid: #ffc107;
--color-progress-high: #4caf50;
```

---

## 4. 実装アプローチ選択肢

### Option A: 既存テンプレートベースの段階的構築（推奨）

確立されたインフラパターンに従い、段階的にドメイン機能を構築する。

**フェーズ分け:**

1. DBスキーマ + マイグレーション + カラートークン
2. APIルート（データ取得 + 自動紐付け + ロック）
3. ページ + 上段コンポーネント（テーブル2つ + フィルタ）
4. 手動紐付け操作（ボタン + DnD + バリデーション）
5. 下段ミラーテーブル（差分ハイライト + フィルタ + 検索）
6. 保存・破棄・終了 + トースト
7. Excel出力
8. レスポンシブ対応

**Trade-offs:**

- ✅ 各フェーズで動作確認可能
- ✅ パターンに忠実で一貫性が保てる
- ✅ テスト追加が容易
- ❌ フェーズ間の依存関係管理が必要

### Option B: 機能横断的な一括構築

全機能を一度に並行開発する。

**Trade-offs:**

- ✅ 開発期間が短縮される可能性
- ❌ デバッグが困難
- ❌ 中間成果物での動作確認が難しい
- ❌ グリーンフィールドでのリスクが高い

### Option C: ハイブリッド（段階的だが並行可能な部分は並行）

Option A のフェーズ分けをベースに、独立した部分（Excel出力、プログレスバー、排他制御）を並行で進める。

**Trade-offs:**

- ✅ 効率とリスクのバランスが良い
- ✅ 並行可能な部分は早期に完成
- ❌ Option A より調整コストがやや増加

---

## 5. 実装複雑度・リスク評価

| 項目                            | 工数             | リスク     | 根拠                                                                                  |
| ------------------------------- | ---------------- | ---------- | ------------------------------------------------------------------------------------- |
| 全体                            | **L（1-2週間）** | **Medium** | 大量の新規コンポーネント + 3つの新規依存 + 複雑なUI状態管理。ただし技術スタックは既知 |
| DBスキーマ + マイグレーション   | S                | Low        | Drizzle パターン確立済み                                                              |
| 自動紐付けアルゴリズム          | S                | Low        | 純粋なロジック、ユニットテスト可能                                                    |
| 上段テーブル2つ + フィルタ      | M                | Low        | Tailwind + React の標準パターン                                                       |
| 手動紐付け操作 + DnD            | M                | Medium     | DnDライブラリの導入・統合が初めて                                                     |
| ミラーテーブル + 差分ハイライト | M                | Low        | 比較ロジックは単純、UIが密                                                            |
| 保存・破棄・終了                | M                | Medium     | クライアント状態管理の複雑さ（スナップショット復元）                                  |
| Excel出力                       | S                | Low        | exceljs の標準的な使い方                                                              |
| 排他制御                        | M                | Medium     | `beforeunload` の信頼性、セッションタイムアウト処理                                   |
| レスポンシブ                    | S                | Low        | Tailwind ブレイクポイントで対応                                                       |

---

## 6. 設計フェーズへの推奨事項

### 推奨アプローチ

**Option A（段階的構築）** を推奨。グリーンフィールドのため各フェーズで動作確認を行いながら進めるのが最も安全。

### 設計フェーズで要調査（Research Needed）

1. **DnDライブラリ選定**: `@dnd-kit/core` vs `react-dnd` — React 19 との互換性確認
2. **排他制御の自動解放**: `beforeunload` + `navigator.sendBeacon` の信頼性。Vercel Edge Functions でのハートビート方式も検討
3. **クライアント状態管理**: 全体の状態を `useReducer` で一元管理するか、コンポーネントごとに分散するか
4. **Excel出力のストリーミング**: 大量データ（数百件）時のメモリ使用量。`exceljs` のストリーミングAPI使用を検討
5. **TBOM-610 画面**: MVP スコープ外だが、遷移元として最低限のスタブ画面が必要かどうか

---

_generated: 2026-03-02_
