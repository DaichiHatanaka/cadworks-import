import { test, expect } from "@playwright/test";

test.describe("紐付け画面", () => {
  test.beforeEach(async ({ page }) => {
    // テストデータをセットアップするAPIを呼び出す（実装が必要）
    // await page.request.post('/api/test/setup-matching-data');
  });

  test("画面初期表示: パラメータ引き継ぎと自動紐付け結果の表示", async ({ page }) => {
    // 紐付け画面に遷移
    await page.goto(
      "/matching?jobNo=TEST001&caseNo=CASE01&constructionType=NEW&listTypes=PUMP,VALVE",
    );

    // ヘッダーに工番・ケース・施工区分が表示されることを確認
    await expect(page.getByText("TEST001")).toBeVisible();
    await expect(page.getByText("CASE01")).toBeVisible();
    await expect(page.getByText("NEW")).toBeVisible();

    // プログレスバーが表示されることを確認
    await expect(page.getByText(/紐付け進捗/)).toBeVisible();

    // 上段左（CAD 未紐付け）テーブルが表示されることを確認
    await expect(page.getByText("CAD（未紐付け）")).toBeVisible();

    // 上段右（T-BOM 未紐付け）テーブルが表示されることを確認
    await expect(page.getByText("T-BOM（未紐付け）")).toBeVisible();

    // 下段（紐付け済み）ミラーテーブルが表示されることを確認
    await expect(page.getByText("紐付け済み")).toBeVisible();
  });

  test("手動紐付けフロー: CAD 選択 → T-BOM 選択 → 紐付け → 下段表示", async ({ page }) => {
    await page.goto("/matching?jobNo=TEST001&caseNo=CASE01&constructionType=NEW&listTypes=PUMP");

    // 上段左で CAD 行を選択（最初の行をクリック）
    const cadTable = page.locator('[data-testid="cad-unlinked-table"]').first();
    await cadTable.locator("tr").nth(1).click();

    // 上段右で T-BOM 行が自動フィルタされることを確認（連動フィルタ）
    const tbomTable = page.locator('[data-testid="tbom-unlinked-table"]').first();
    await expect(tbomTable).toBeVisible();

    // T-BOM 行を選択
    await tbomTable.locator("tr").nth(1).click();

    // 「紐付け」ボタンを押下
    await page.getByRole("button", { name: "紐付け" }).click();

    // 下段ミラーテーブルに紐付け結果が表示されることを確認
    const linkedTable = page.locator('[data-testid="linked-mirror-table"]').first();
    await expect(linkedTable.locator("tr").nth(1)).toBeVisible();

    // ステータスバッジが「未保存」（黄色）で表示されることを確認
    await expect(linkedTable.locator('[data-status="unsaved"]').first()).toBeVisible();

    // プログレスバーが更新されることを確認
    await expect(page.getByText(/紐付け進捗/)).toContainText("%");
  });

  test("LIST_TYPE 不一致時の警告ダイアログ表示", async ({ page }) => {
    await page.goto(
      "/matching?jobNo=TEST001&caseNo=CASE01&constructionType=NEW&listTypes=PUMP,VALVE",
    );

    // 異なる LIST_TYPE の行を選択して紐付けを試行
    // （テストデータに PUMP と VALVE が存在する前提）

    // 連動フィルタを OFF にする
    await page.getByRole("checkbox", { name: "連動フィルタ" }).uncheck({ force: true });

    // CAD 側で PUMP を選択
    const cadTable = page.locator('[data-testid="cad-unlinked-table"]').first();
    await cadTable.locator('tr:has-text("PUMP")').first().click({ force: true });

    // T-BOM 側で VALVE を選択
    const tbomTable = page.locator('[data-testid="tbom-unlinked-table"]').first();
    await tbomTable.locator('tr:has-text("VALVE")').first().click({ force: true });

    // ダイアログリスナーを設定
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toContain("リストタイプが一致しません");
      dialog.accept();
    });

    // 紐付けボタンを押下
    await page.getByRole("button", { name: "紐付け" }).click();
  });

  test("保存・破棄・終了フロー", async ({ page }) => {
    await page.goto("/matching?jobNo=TEST001&caseNo=CASE01&constructionType=NEW&listTypes=PUMP");

    // 手動紐付けを実行して未保存状態にする
    const cadTable = page.locator('[data-testid="cad-unlinked-table"]').first();
    await cadTable.locator("tr").nth(1).click();

    const tbomTable = page.locator('[data-testid="tbom-unlinked-table"]').first();
    await tbomTable.locator("tr").nth(1).click();

    await page.getByRole("button", { name: "紐付け" }).click();

    // 保存ボタンを押下
    await page.getByRole("button", { name: "保存" }).click();

    // トースト通知が表示されることを確認
    await expect(page.getByText(/件の紐付けを保存しました/)).toBeVisible();

    // ステータスバッジが「保存済み」（緑色）に変わることを確認
    const linkedTable = page.locator('[data-testid="linked-mirror-table"]').first();
    await expect(linkedTable.locator('[data-status="saved"]').first()).toBeVisible();
  });

  test("破棄操作: 前回保存時点への復元", async ({ page }) => {
    await page.goto("/matching?jobNo=TEST001&caseNo=CASE01&constructionType=NEW&listTypes=PUMP");

    // 手動紐付けを実行
    const cadTable = page.locator('[data-testid="cad-unlinked-table"]').first();
    await cadTable.locator("tr").nth(1).click();

    const tbomTable = page.locator('[data-testid="tbom-unlinked-table"]').first();
    await tbomTable.locator("tr").nth(1).click();

    await page.getByRole("button", { name: "紐付け" }).click();

    // ダイアログリスナーを設定
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toContain("未保存の変更をすべて破棄");
      dialog.accept();
    });

    // 破棄ボタンを押下
    await page.getByRole("button", { name: "破棄" }).click();

    // 下段から紐付け結果が削除され、上段に復元されることを確認
    const linkedTable = page.locator('[data-testid="linked-mirror-table"]').first();
    await expect(linkedTable.locator("tr").nth(1)).not.toBeVisible();
  });

  test("終了確認ダイアログ: 未保存データありの場合", async ({ page }) => {
    await page.goto("/matching?jobNo=TEST001&caseNo=CASE01&constructionType=NEW&listTypes=PUMP");

    // 手動紐付けを実行（未保存状態）
    const cadTable = page.locator('[data-testid="cad-unlinked-table"]').first();
    await cadTable.locator("tr").nth(1).click();

    const tbomTable = page.locator('[data-testid="tbom-unlinked-table"]').first();
    await tbomTable.locator("tr").nth(1).click();

    await page.getByRole("button", { name: "紐付け" }).click();

    // ダイアログリスナーを設定
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toContain("未保存のデータがあります");
      dialog.dismiss(); // キャンセル
    });

    // 終了ボタンを押下
    await page.getByRole("button", { name: "紐付け終了" }).click();

    // キャンセルしたため、画面に留まることを確認
    await expect(page).toHaveURL(/\/matching/);
  });

  test("連動フィルタ: CAD 行選択時の T-BOM 自動フィルタ", async ({ page }) => {
    await page.goto(
      "/matching?jobNo=TEST001&caseNo=CASE01&constructionType=NEW&listTypes=PUMP,VALVE",
    );

    // 連動フィルタが ON であることを確認
    await expect(page.getByRole("checkbox", { name: "連動フィルタ" })).toBeChecked();

    // CAD 側で PUMP の行を選択
    const cadTable = page.locator('[data-testid="cad-unlinked-table"]').first();
    await cadTable.locator('tr:has-text("PUMP")').first().click();

    // T-BOM 側が PUMP でフィルタされることを確認
    const tbomTable = page.locator('[data-testid="tbom-unlinked-table"]').first();
    await expect(tbomTable.locator('tr:has-text("PUMP")')).toBeVisible();
    await expect(tbomTable.locator('tr:has-text("VALVE")')).not.toBeVisible();
  });

  test("Excel 出力: ダウンロードが実行される", async ({ page }) => {
    await page.goto("/matching?jobNo=TEST001&caseNo=CASE01&constructionType=NEW&listTypes=PUMP");

    // ダウンロードイベントをリスナーで待機
    const downloadPromise = page.waitForEvent("download");

    // Excel 出力ボタンを押下
    await page.getByRole("button", { name: "Excel出力" }).click();

    // ダウンロードが開始されることを確認
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("matching-result");
    expect(download.suggestedFilename()).toContain(".xlsx");
  });

  test("レスポンシブ対応: 1024px 未満では警告を表示", async ({ page }) => {
    // ビューポートを 1000px に設定
    await page.setViewportSize({ width: 1000, height: 800 });

    await page.goto("/matching?jobNo=TEST001&caseNo=CASE01&constructionType=NEW&listTypes=PUMP");

    // 警告メッセージが表示されることを確認
    await expect(page.getByText("画面幅が不足しています")).toBeVisible();
    await expect(page.getByText("最低 1024px の画面幅が必要")).toBeVisible();
  });
});
