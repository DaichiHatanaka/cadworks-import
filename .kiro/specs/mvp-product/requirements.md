# Requirements Document

## Introduction

本書は CADWorx 手動紐付け画面（TBOM-611）の MVP 実装要件を定義する。
CADWorx（設計CAD）の機器データと T-BOM（原価管理）の原価項目を突合・紐付けするための中核画面であり、
UIUX設計書および要件定義仕様書に基づき、EARS形式の受け入れ基準で要件を網羅する。

**対象システム名**: TBOM-611（紐付け画面）
**対象ユーザー**: 水処理プラントのプロジェクト担当者（作業者）

---

## Requirements

### Requirement 1: 画面遷移・初期表示

**Objective:** As a 作業者, I want TBOM-610 から紐付け画面へ遷移し、対象データが自動的に読み込まれること, so that 紐付け作業をすぐに開始できる

#### Acceptance Criteria 1

1. When 作業者が TBOM-610 で「紐付け開始」ボタンを押下した時, the TBOM-611 shall 紐付け画面へ遷移し、工番・ケース・施工区分・対象リストタイプを引き継いで表示する
2. When 紐付け画面が読み込まれた時, the TBOM-611 shall CWX_DATA および TBOM_DATA をサーバーから取得し、自動紐付けロジックを実行した上で上段・下段に振り分けて表示する
3. When 初期表示が完了した時, the TBOM-611 shall ヘッダーに画面タイトル（取込対象に応じて動的変更）、工番、ケース、施工区分を表示する
4. When 初期表示が完了した時, the TBOM-611 shall 紐付け進捗バー（紐付け済み件数 / CAD 全件数）をヘッダーに表示する

### Requirement 2: 自動紐付けロジック

**Objective:** As a 作業者, I want 画面表示前に CAD と T-BOM が自動でマッチングされること, so that 手動作業の対象が最小限に絞り込まれる

#### Acceptance Criteria 2

1. When 自動紐付け処理が実行された時, the TBOM-611 shall CAD 側レコードを起点に、LIST_TYPE が一致する T-BOM レコードから KID で対応先を探索する
2. When LIST_TYPE と KID が一致し ID_COUNT が完全一致するレコードが見つかった時, the TBOM-611 shall 当該ペアを「保存済み」ステータスで下段ミラーテーブルに表示する
3. When LIST_TYPE と KID が一致し ID_COUNT の下5桁のみが一致するレコードが見つかった時, the TBOM-611 shall 当該ペアを「未保存」ステータスで下段ミラーテーブルに表示する
4. When LIST_TYPE または KID が不一致で紐付け不可と判定されたレコードがある時, the TBOM-611 shall CAD 側レコードを上段左テーブルに、T-BOM 側レコードを上段右テーブルに未紐付けとして残す

### Requirement 3: 上段 — 未紐付け作業エリア

**Objective:** As a 作業者, I want 未紐付けの CAD データと T-BOM データを左右対称に一覧表示し、フィルタで絞り込めること, so that 紐付け候補を素早く見つけられる

#### Acceptance Criteria 3

1. The TBOM-611 shall 上段左に CAD 未紐付け一覧（5属性: LIST_TYPE, KIKI_NO, KIKI_BAME, QTY_ORD, SHORT_SPEC）を LIST_TYPE → KID → ID_COUNT の昇順で表示する
2. The TBOM-611 shall 上段右に T-BOM 未紐付け一覧（同一5属性・同一カラム順）を LIST_TYPE → KID の昇順で表示する
3. The TBOM-611 shall 上段左右それぞれのヘッダーに残件数をリアルタイムで表示する（「CAD（未紐付け）残 XX件」「T-BOM（未紐付け）残 XX件」）
4. While 連動フィルタが ON（デフォルト）の状態で, when 作業者が上段左の CAD 行を選択した時, the TBOM-611 shall 上段右を当該行と同一の LIST_TYPE に自動フィルタする
5. When 作業者が上段左または上段右の行を選択した時, the TBOM-611 shall 選択行の詳細情報をテーブル内にインライン展開で表示する
6. The TBOM-611 shall 上段左に検索付きドロップダウンによるリストタイプフィルタ（「全て」+ 表内に存在するリストタイプの動的リスト）を提供する

### Requirement 4: 手動紐付け操作

**Objective:** As a 作業者, I want CAD と T-BOM を手動で紐付け・追加・解除できること, so that 自動紐付けで対応できなかったデータを手動で処理できる

#### Acceptance Criteria 4

1. When 作業者が上段左で CAD 行を選択し、上段右で T-BOM 行を選択した状態で「紐付け」ボタンを押下した時, the TBOM-611 shall 当該ペアを「未保存」ステータスで下段ミラーテーブルに追加し、上段左右から該当行を削除する
2. When 作業者が上段左で CAD 行を選択した状態で「追加」ボタンを押下した時, the TBOM-611 shall 当該 CAD 行を T-BOM 対応なしで下段に追加し（T-BOM 側グレーアウト表示）、上段左から該当行を削除する
3. When 作業者が下段で行を選択した状態で「紐付け解除」ボタンを押下した時, the TBOM-611 shall 当該行の紐付けを解除し、CAD 側を上段左に、T-BOM 側を上段右に戻す
4. When 作業者が上段左の CAD 行を上段右の T-BOM 行へドラッグ＆ドロップした時, the TBOM-611 shall ボタン操作と同等の紐付け処理を実行する
5. When 作業者が上段左の CAD 行をダブルクリックした時, the TBOM-611 shall T-BOM 対応なしの「追加」操作を実行する
6. When 紐付け・追加・解除の操作が完了した時, the TBOM-611 shall プログレスバーと残件数をリアルタイムに更新する
7. If 作業者が異なる LIST_TYPE の CAD 行と T-BOM 行を選択して「紐付け」を押下した場合, the TBOM-611 shall 「リストタイプが一致しません。同一リストタイプの機器のみ紐付けできます。」と警告ダイアログを表示し、紐付け処理を中止する
8. While 上段左で行が未選択の状態で, the TBOM-611 shall 「紐付け」ボタンおよび「追加」ボタンを無効化する
9. While 下段で行が未選択の状態で, the TBOM-611 shall 「紐付け解除」ボタンを無効化する

### Requirement 5: 下段 — 紐付け済みミラー比較テーブル

**Objective:** As a 作業者, I want 紐付け済みデータの CAD 側と T-BOM 側を左右対称に比較し、差異が一目でわかること, so that 紐付け結果の正しさを効率的に確認できる

#### Acceptance Criteria 5

1. The TBOM-611 shall 下段ミラーテーブルにステータス列 + CAD 側5属性 + T-BOM 側5属性を左右対称で表示する
2. When 紐付け済みペアの同一属性（KIKI_NO, KIKI_BAME, QTY_ORD, SHORT_SPEC）の値が CAD 側と T-BOM 側で異なる場合, the TBOM-611 shall 当該セルをオレンジ色（#FFA500）でハイライト表示する
3. When 紐付け済み行が T-BOM 対応なし（追加）の場合, the TBOM-611 shall T-BOM 側の全セルをグレー背景（#E0E0E0）で表示する
4. The TBOM-611 shall ステータス列に未保存を黄色バッジ（#FFC107）、保存済みを緑バッジ（#4CAF50）で表示する
5. The TBOM-611 shall 下段に検索付きドロップダウンによるリストタイプフィルタを提供する
6. The TBOM-611 shall 下段にステータスフィルタ（全て表示 / 未保存のみ / 保存済みのみ）を提供する
7. When 作業者がテキスト検索フィールドに文字を入力した時, the TBOM-611 shall 機器番号（CAD/T-BOM 両側）および機器名称（CAD/T-BOM 両側）を対象にインクリメンタルサーチ（部分一致）で絞り込む
8. The TBOM-611 shall 下段テーブルを LIST_TYPE → KID の昇順でソートして表示する

### Requirement 6: 保存・破棄・終了

**Objective:** As a 作業者, I want 紐付け結果を保存・破棄でき、終了時に未保存データの確認ができること, so that データの整合性を保ちながら安全に作業を完了できる

#### Acceptance Criteria 6

1. When 作業者が「保存」ボタンを押下した時, the TBOM-611 shall 下段テーブルの「未保存」レコードを DB に反映し、ステータスバッジを黄→緑に更新し、トースト通知「XX件の紐付けを保存しました。」を3秒間表示する
2. When 作業者が「破棄」ボタンを押下した時, the TBOM-611 shall 「未保存の変更をすべて破棄しますか？この操作は取り消せません。」と確認ダイアログを表示する
3. When 破棄確認ダイアログで「はい」を選択した時, the TBOM-611 shall 前回保存時点の状態に復元する
4. When 未保存行がある状態で作業者が「紐付け終了」ボタンを押下した時, the TBOM-611 shall 「未保存のデータがあります。保存せずに終了しますか？」と確認ダイアログを表示する
5. When 未保存行がない状態で作業者が「紐付け終了」ボタンを押下した時, the TBOM-611 shall 「紐付け作業を終了します。よろしいですか？」と確認ダイアログを表示する
6. When 終了確認ダイアログで「はい」を選択した時, the TBOM-611 shall ロックを解放し TBOM-101（メイン画面）へ遷移する

### Requirement 7: Excel 出力

**Objective:** As a 作業者, I want 紐付け結果を Excel ファイルで出力できること, so that 社内報告や記録保管に使用できる

#### Acceptance Criteria 7

1. When 作業者が「Excel出力」ボタンを押下した時, the TBOM-611 shall 下段ミラーテーブルの内容（ステータス + CAD側5属性 + T-BOM側5属性）を Excel ファイルとしてサーバー側で生成しダウンロードする

### Requirement 8: 排他制御

**Objective:** As a 作業者, I want 同一工番を他のユーザーが同時に編集できないこと, so that データの不整合を防止できる

#### Acceptance Criteria 8

1. When 紐付け画面が表示された時, the TBOM-611 shall 対象工番をロックし、他ユーザーの編集を防止する
2. While 他ユーザーが対象工番をロック中の状態で, the TBOM-611 shall ロック者名と開始時刻を画面上に表示し、編集操作を禁止する
3. When 画面を閉じた時またはセッションタイムアウトが発生した時, the TBOM-611 shall ロックを自動的に解放する

### Requirement 9: プログレスバー

**Objective:** As a 作業者, I want 紐付け作業の進捗率を常時確認できること, so that 残作業量を把握しながら効率的に作業を進められる

#### Acceptance Criteria 9

1. The TBOM-611 shall ヘッダーに水平プログレスバーとテキスト（「紐付け進捗 XX% (YY/ZZ)」）を常時表示する
2. The TBOM-611 shall プログレスバーの分母を CAD データ総件数、分子を紐付け済み件数（自動+手動、ステータス問わず）として計算する
3. When 進捗率が 0-49% の時, the TBOM-611 shall プログレスバーを赤色（#F44336）で表示する
4. When 進捗率が 50-89% の時, the TBOM-611 shall プログレスバーを黄色（#FFC107）で表示する
5. When 進捗率が 90-100% の時, the TBOM-611 shall プログレスバーを緑色（#4CAF50）で表示する
6. When 紐付け・追加・解除の操作が完了した時, the TBOM-611 shall プログレスバーをリアルタイムに更新する

### Requirement 10: レスポンシブ対応

**Objective:** As a 作業者, I want 様々な画面サイズで紐付け作業を行えること, so that 異なるモニター環境でも作業可能である

#### Acceptance Criteria 10

1. While 画面幅が 1440px 以上の環境で, the TBOM-611 shall 標準レイアウト（上段2ペイン + 下段フルワイド）を表示する
2. While 画面幅が 1024-1439px の環境で, the TBOM-611 shall 上段2ペイン幅を縮小し、概略仕様カラムをツールチップ化して表示する
3. If 画面幅が 1024px 未満の場合, the TBOM-611 shall 最低幅要求の警告メッセージを表示する

### Requirement 11: UI カラーパレット・視覚ルール

**Objective:** As a 作業者, I want 一貫したカラーコードで情報の意味を直感的に把握できること, so that 大量データの中でも重要な差異を見逃さない

#### Acceptance Criteria 11

1. The TBOM-611 shall テーブルヘッダーを青背景（#1976D2）+ 白文字で表示する
2. The TBOM-611 shall 下段ミラーテーブルの CAD 側ヘッダーラベルを濃青（#1565C0）、T-BOM 側ヘッダーラベルを濃ティール（#00695C）で表示する
3. The TBOM-611 shall フッターのアクションバーで低リスク操作（Excel出力）を左端に、高リスク操作（破棄・保存）を右寄りに、「紐付け終了」を最右端に分離配置する
