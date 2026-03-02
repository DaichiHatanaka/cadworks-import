# Research & Design Decisions

## Summary

- **Feature**: `mvp-product` — CADWorx 手動紐付け画面 (TBOM-611)
- **Discovery Scope**: New Feature（グリーンフィールド）
- **Key Findings**:
  1. ドラッグ&ドロップは `@dnd-kit/core` が React 19 対応・軽量・TypeScript 完全対応で最適
  2. Excel 出力は `exceljs` がセルスタイリング（色・フォント・罫線）をネイティブ対応し、Vercel サーバーレスでインメモリ生成可能
  3. 200-500 行/テーブルの規模では仮想化は不要。`@tanstack/react-table`（ヘッドレス）で十分なパフォーマンス
  4. 排他制御は Neon HTTP ドライバの制約上アドバイザリロック不可。TTL + ハートビート方式のアプリケーションレベルロックテーブルを採用

---

## Research Log

### ドラッグ&ドロップライブラリ選定

- **Context**: 要件 4.4 — CAD 行を T-BOM 行へドラッグ&ドロップで紐付け操作を実行
- **Sources Consulted**: npm レジストリ、GitHub Issues（dnd-kit #1654, #1842）、Bundlephobia、各ライブラリ公式ドキュメント
- **Findings**:
  - `@dnd-kit/core` v安定版: React 19 実質対応、~10 kB gzip、外部依存ゼロ、TypeScript 完全対応
  - `@dnd-kit/react`（新 API v0.3.2）: プレリリース段階。Next.js App Router での `"use client"` 問題あり。本番投入は時期尚早
  - `react-dnd`: 最終リリース約4年前。React 19 で型エラー発生。事実上メンテナンス停止
  - HTML5 ネイティブ DnD API: タッチ非対応、ブラウザ間挙動差異多数、アクセシビリティ困難
  - `@atlaskit/pragmatic-drag-and-drop`: 軽量（4.7 kB）だが React 19 完全テスト未完了
- **Implications**: `@dnd-kit/core` + `@dnd-kit/sortable` を採用。2テーブル間ドラッグは `useDroppable` に異なる ID を割り当てる公式パターンで実現

### Excel ファイル生成

- **Context**: 要件 7.1 — 下段ミラーテーブルの内容を Excel ファイルとしてサーバー側で生成しダウンロード
- **Sources Consulted**: npm レジストリ、exceljs GitHub Discussions (#2853)、SheetJS 公式ドキュメント、Bundlephobia、Next.js 16 リリースノート
- **Findings**:
  - `exceljs` v4.4.0: MIT ライセンス、`writeBuffer()` でインメモリ生成可能、セル塗りつぶし・フォント・罫線をネイティブ対応（ARGB 形式）、~960 kB だがサーバーサイド専用のためクライアントバンドル影響なし
  - `xlsx`（SheetJS CE）: 公開 npm レジストリから削除済み。CDN tarball インストール必須。セルスタイリングは Pro ライセンス（有料）が必要
  - `xlsx-populate`: 2020年以降メンテナンス停止
  - `xlsx-js-style`: SheetJS CE フォークだが 2022年以降メンテナンス停止
- **Implications**: `exceljs` を採用。Next.js 16 Turbopack 環境では `serverExternalPackages: ['exceljs']` の設定が必要な場合あり。Route Handler 内で `workbook.xlsx.writeBuffer()` → `new Response(buffer)` パターンで実装

### テーブルライブラリ・仮想化

- **Context**: 要件 3, 5 — 上段左右・下段の3テーブルで各 200-500 行を表示。行選択、インライン展開、リアルタイムフィルタ、カスタムセルレンダリング
- **Sources Consulted**: TanStack Table 公式ドキュメント、AG Grid 公式互換性情報、Bundlephobia、GitHub Discussions（TanStack #5607、react-virtuoso #575）
- **Findings**:
  - 200-500 行/テーブルでは仮想化は必須ではない。複雑セル込みで初期レンダリング 200-400ms、フィルタ反映 50-150ms（中程度マシン）
  - `@tanstack/react-table` v8: React 19 対応確認済み、ヘッドレス設計で完全な DOM 制御、TypeScript ジェネリクス対応、行選択・展開・フィルタがすべて組み込み。~100 kB
  - AG Grid Community: 全機能組み込みだがバンドルサイズ ~700 kB。Tailwind CSS とのスタイリング統合に追加作業が必要
  - `react-window`: 2021年以降メンテナンス停止。固定行高のみでインライン展開不可
  - `react-virtuoso`: DnD 統合が困難（仮想化による DOM アンマウントで draggable 参照が壊れる）
- **Implications**: `@tanstack/react-table` v8 をヘッドレステーブルとして採用。仮想化は現時点ではスキップし、パフォーマンス計測で必要と判明した場合に `@tanstack/react-virtual` を追加。クロステーブル DnD は `@dnd-kit` の `DndContext` を画面レベルで共有し、`onDragEnd` で操作振り分け

### 排他制御（悲観的ロック）

- **Context**: 要件 8.1-8.3 — 工番単位のロックで同時編集防止、ロック者情報表示、自動解放
- **Sources Consulted**: Neon 公式互換性ドキュメント、PostgreSQL Explicit Locking ドキュメント、MDN（sendBeacon, visibilitychange）、Vercel Cron Jobs ドキュメント
- **Findings**:
  - PostgreSQL `pg_advisory_lock()`（セッションレベル）: Neon HTTP ドライバはセッションを維持しないため使用不可。PgBouncer トランザクションモードでもセッションロックは解放される
  - PostgreSQL `pg_advisory_xact_lock()`（トランザクションレベル）: API コール単位でロック→解放されるため、ユーザーの編集セッション（数分〜数時間）には不適
  - `SELECT FOR UPDATE`: 同上の理由で不適
  - Redis 分散ロック（Redlock）: 別途 Redis インスタンスが必要。TTL 方式で PostgreSQL 上で十分
  - WebSocket / SSE: Vercel サーバーレスは長時間接続不可
  - **採用方式**: アプリケーションレベルロックテーブル（`job_locks`）+ TTL（120秒）+ ハートビート（60秒間隔）
  - `lockToken`（`crypto.randomUUID()`）を `sessionStorage` に保持し、タブ単位でのロック所有権を保証
  - ブラウザ終了時は `visibilitychange` + `pagehide` で `navigator.sendBeacon` による解放（信頼性 ~91%）
  - 残り ~9% のケース（クラッシュ等）は TTL で 2分後に自動失効
  - 失効ロックの物理削除は Vercel Cron Job（Hobby: 日次 / Pro: 毎分可能）
- **Implications**: `job_locks` テーブルを Drizzle スキーマに追加。API Route Handler 4本（acquire, renew, release, status）を実装。クライアント側に `useLock` フックを用意

---

## Architecture Pattern Evaluation

| Option                           | Description                                                    | Strengths                                                   | Risks / Limitations                                        | Notes    |
| -------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------- | -------- |
| Feature-Sliced (App Router 準拠) | `src/app/matching/` 配下にページ・コンポーネント・API を集約   | steering の App Router 規約に完全準拠。機能単位でコード分離 | 大規模化時にルート内が肥大化する可能性                     | **採用** |
| Domain-Driven (分離レイヤー構成) | `src/domain/`, `src/application/`, `src/infrastructure/` の3層 | ビジネスロジックの独立性が高い                              | 現行テンプレートの App Router 中心構成と乖離。過剰な抽象化 | 不採用   |

---

## Design Decisions

### Decision: テーブルライブラリ — TanStack Table v8（ヘッドレス）

- **Context**: 3つのテーブル（上段左・上段右・下段）で行選択、インライン展開、フィルタ、カスタムセルレンダリングが必要
- **Alternatives Considered**:
  1. AG Grid Community — 全機能内蔵だがバンドル ~700 kB、Tailwind 統合が複雑
  2. 自前実装 — 軽量だが行選択・フィルタ・展開のすべてを実装する工数が大きい
- **Selected Approach**: `@tanstack/react-table` v8 をヘッドレスで使用し、Tailwind CSS で完全にスタイル制御
- **Rationale**: steering の Tailwind v4 + cn() パターンとの親和性が最も高い。ヘッドレス設計により DOM 構造を完全に制御でき、カラーパレット仕様（#FFA500、#4CAF50 等）を直接適用可能
- **Trade-offs**: クロステーブル DnD の統合コードが必要（~100-200行）。AG Grid ならゼロ設定だが、バンドルサイズとスタイリング自由度を優先
- **Follow-up**: 500行超のデータセットでパフォーマンス計測を実施し、必要に応じて仮想化を追加

### Decision: ドラッグ&ドロップ — @dnd-kit/core

- **Context**: CAD 行を T-BOM テーブルへドラッグ&ドロップで紐付け
- **Alternatives Considered**:
  1. HTML5 ネイティブ DnD — バンドルゼロだがタッチ非対応・ブラウザ差異多数
  2. react-dnd — メンテナンス停止、React 19 型エラー
  3. pragmatic-drag-and-drop — 軽量だが React 19 完全テスト未了
- **Selected Approach**: `@dnd-kit/core` 安定版 + `useDraggable` / `useDroppable`
- **Rationale**: React 19 対応実績最多、~10 kB、TypeScript 完全対応、タッチ・アクセシビリティ対応
- **Trade-offs**: `@dnd-kit/react` 新 API への将来移行が発生する可能性あり

### Decision: 排他制御 — TTL + ハートビート方式ロックテーブル

- **Context**: 工番単位で同時編集を防止。Neon HTTP ドライバ + Vercel サーバーレス環境
- **Alternatives Considered**:
  1. PostgreSQL アドバイザリロック — Neon HTTP ドライバのセッションレス特性と互換性なし
  2. Redis 分散ロック — 追加インフラコスト
  3. WebSocket 常時接続 — Vercel サーバーレスでは長時間接続不可
- **Selected Approach**: `job_locks` テーブル + TTL 120秒 + ハートビート 60秒 + `lockToken` によるタブ単位所有権
- **Rationale**: 既存の Neon PostgreSQL + Drizzle ORM の構成内で完結。追加インフラ不要
- **Trade-offs**: クラッシュ時の最大ロック保持時間が ~2分（TTL）。即時解放はできないが業務要件上許容範囲

### Decision: Excel 出力 — exceljs サーバーサイド生成

- **Context**: 下段ミラーテーブルの内容を .xlsx ファイルとしてエクスポート
- **Alternatives Considered**:
  1. SheetJS CE — セルスタイリング非対応（Pro のみ）
  2. クライアントサイド生成 — サーバーデータの再取得が必要、環境依存
- **Selected Approach**: `exceljs` を Route Handler 内で使用、`writeBuffer()` でインメモリ生成
- **Rationale**: セル塗りつぶし（差異ハイライト #FFA500、ステータスバッジ色）をネイティブ対応。MIT ライセンス。サーバーサイド専用のためクライアントバンドルに影響なし
- **Trade-offs**: ライブラリサイズ ~960 kB だがサーバー側のみ。最終リリースが 2023年10月で更新頻度低いが、機能的に安定

---

## Risks & Mitigations

- **リスク1**: @dnd-kit/core の `"use client"` ディレクティブ管理 — DnD コンポーネントはすべて Client Component 内に配置し、Server Component とのバウンダリを明確にする
- **リスク2**: exceljs の CJS / ESM 境界問題 — `serverExternalPackages: ['exceljs']` を next.config.ts に設定。Route Handler 内でのみ import する
- **リスク3**: ロックのハートビート失敗によるデータ不整合 — ハートビート失敗時に UI 警告を表示し、ユーザーに保存を促す。TTL は業務中断を最小化する 120秒に設定
- **リスク4**: 500行超のデータでのテーブルパフォーマンス — 初回リリース後にパフォーマンスプロファイリングを実施。閾値超過時は `@tanstack/react-virtual` を追加

---

## References

- [@dnd-kit/core — npm](https://www.npmjs.com/package/@dnd-kit/core) — React DnD ライブラリ
- [TanStack Table v8 — 公式ドキュメント](https://tanstack.com/table/v8) — ヘッドレステーブルライブラリ
- [exceljs — npm](https://www.npmjs.com/package/exceljs) — Excel 生成ライブラリ
- [Neon Compatibility — 公式ドキュメント](https://neon.com/docs/reference/compatibility) — PostgreSQL 互換性制約
- [Navigator.sendBeacon() — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) — ページ終了時のビーコン送信
- [Vercel Cron Jobs — 公式ドキュメント](https://vercel.com/docs/cron-jobs) — 定期実行ジョブ
