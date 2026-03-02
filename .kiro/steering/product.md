# Product Overview

CADWorx データ突合・リンク画面（TBOM-611）— 水処理プラント積算システムにおける CAD データインポート前の突合ツール。
レガシーデスクトップアプリケーションの Web 移行版。

## Core Capabilities

1. **自動リンク**: ページ読込時に LIST_TYPE + KID + ID_COUNT ルールで CAD レコードと T-BOM レコードを事前マッチング
2. **手動リンク UI**: 上部ペイン（CAD 左 / T-BOM 右）で未リンク一覧を表示し、下部ペインで比較テーブルをミラー表示
3. **差分ハイライト**: 5 主要フィールド（LIST_TYPE, KIKI_NO, KIKI_BAME, QTY_ORD, SHORT_SPEC）のセルレベル不一致をオレンジ表示
4. **排他ロック**: ジョブ番号単位の行レベルロックで同時編集を防止
5. **Excel エクスポート**: リンク結果テーブルの Excel 出力

## Target Use Cases

- プロジェクト担当者が CADWorx 出力データと T-BOM コスト管理データを突合し、リンク判断を行う
- 数百件の機器レコードを視覚的に比較し、不一致を素早く特定する
- リンク結果を確定・保存し、後続のインポート処理に引き渡す

## Value Proposition

手作業のテーブル目視比較を排除し、自動マッチング＋差分ハイライトで突合作業を大幅に効率化。
Web 化により場所を問わずアクセス可能に。

## Domain Concepts

| 概念             | 説明                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| `CWX_DATA`       | CADWorx 側のソーステーブル                                            |
| `TBOM_DATA`      | コスト管理側のソーステーブル                                          |
| マッチキー       | LIST_TYPE + KID + ID_COUNT の組み合わせ                               |
| ステータス       | "unsaved"（黄バッジ）/ "saved"（緑バッジ）                            |
| 自動リンクルール | ID_COUNT 完全一致 → saved、下位5桁一致 → unsaved、一致なし → 未リンク |

---

_Focus on patterns and purpose, not exhaustive feature lists_
