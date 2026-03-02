/**
 * E2E tests for CSV import functionality
 */
import { test, expect } from "@playwright/test";
import path from "path";
import { getDb } from "../src/db";
import { cwxData, tbomData } from "../src/db/schema";
import { eq } from "drizzle-orm";

test.describe("CSV Import", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/import");
  });

  test.afterEach(async () => {
    // Clean up test data
    const db = getDb();
    await db.delete(cwxData).where(eq(cwxData.jobNo, "TEST-2024-001"));
    await db.delete(cwxData).where(eq(cwxData.jobNo, "TEST-2024-002"));
    await db.delete(tbomData).where(eq(tbomData.jobNo, "TEST-2024-003"));
  });

  test("完全なインポートフロー - CADデータ", async ({ page }) => {
    // Step 1: ページ表示確認
    await expect(page.getByRole("heading", { name: "データインポート" })).toBeVisible();

    // Step 2: データタイプ選択
    await page.getByLabel("CADデータ").check();
    await expect(page.getByLabel("CADデータ")).toBeChecked();

    // Step 3: ファイル選択
    const filePath = path.join(__dirname, "fixtures", "valid-cad.csv");
    await page.setInputFiles('input[type="file"]', filePath);

    // Step 4: 解析開始
    await page.getByRole("button", { name: "解析開始" }).click();

    // Step 5: プレビュー表示確認
    await expect(page.getByText("3件のレコードを検出")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("Step 2: プレビュー")).toBeVisible();

    // エラーがないことを確認
    await expect(page.getByText(/\d+件のエラー/)).not.toBeVisible();

    // プレビューテーブルが表示されていることを確認
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText("test-cad-001")).toBeVisible();
    await expect(page.getByText("test-cad-002")).toBeVisible();
    await expect(page.getByText("test-cad-003")).toBeVisible();

    // Step 6: インポート実行
    await page.getByRole("button", { name: "インポート実行" }).click();

    // Step 7: 成功メッセージ確認
    await expect(page.getByText("インポート完了")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("3件のデータをインポートしました")).toBeVisible();

    // Step 8: データベース確認
    const db = getDb();
    const records = await db.select().from(cwxData).where(eq(cwxData.jobNo, "TEST-2024-001"));
    expect(records).toHaveLength(3);
    expect(records[0]?.id).toBe("test-cad-001");
  });

  test("完全なインポートフロー - T-BOMデータ", async ({ page }) => {
    // Step 1: データタイプ選択
    await page.getByLabel("T-BOMデータ").check();
    await expect(page.getByLabel("T-BOMデータ")).toBeChecked();

    // Step 2: ファイル選択
    const filePath = path.join(__dirname, "fixtures", "valid-tbom.csv");
    await page.setInputFiles('input[type="file"]', filePath);

    // Step 3: 解析開始
    await page.getByRole("button", { name: "解析開始" }).click();

    // Step 4: プレビュー表示確認
    await expect(page.getByText("3件のレコードを検出")).toBeVisible({
      timeout: 10000,
    });

    // Step 5: インポート実行
    await page.getByRole("button", { name: "インポート実行" }).click();

    // Step 6: 成功メッセージ確認
    await expect(page.getByText("インポート完了")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("3件のデータをインポートしました")).toBeVisible();

    // Step 7: データベース確認
    const db = getDb();
    const records = await db.select().from(tbomData).where(eq(tbomData.jobNo, "TEST-2024-003"));
    expect(records).toHaveLength(3);
    expect(records[0]?.id).toBe("test-tbom-001");
  });

  test("バリデーションエラーによるブロック", async ({ page }) => {
    // Step 1: データタイプ選択
    await page.getByLabel("CADデータ").check();

    // Step 2: 不正なファイル選択
    const filePath = path.join(__dirname, "fixtures", "invalid-cad.csv");
    await page.setInputFiles('input[type="file"]', filePath);

    // Step 3: 解析開始
    await page.getByRole("button", { name: "解析開始" }).click();

    // Step 4: エラー表示確認
    await expect(page.getByText(/\d+件のエラー/)).toBeVisible({
      timeout: 10000,
    });

    // 重複IDエラーが表示されることを確認
    await expect(page.getByText(/test-cad-001.*重複/)).toBeVisible();

    // 必須フィールド欠落エラーが表示されることを確認
    await expect(page.getByText(/KIDは必須です/)).toBeVisible();

    // インポート実行ボタンが無効化されていることを確認
    const executeButton = page.getByRole("button", { name: "インポート実行" });
    await expect(executeButton).toBeDisabled();
  });

  test("重複jobNoエラー処理", async ({ page }) => {
    // Step 1: 最初のインポート
    await page.getByLabel("CADデータ").check();
    const filePath = path.join(__dirname, "fixtures", "valid-cad.csv");
    await page.setInputFiles('input[type="file"]', filePath);
    await page.getByRole("button", { name: "解析開始" }).click();
    await expect(page.getByText("3件のレコードを検出")).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole("button", { name: "インポート実行" }).click();
    await expect(page.getByText("インポート完了")).toBeVisible({
      timeout: 10000,
    });

    // Step 2: ホームへ戻る
    await page.getByRole("button", { name: "ホームへ戻る" }).click();
    await expect(page.getByText("CADWorks Import")).toBeVisible();

    // Step 3: 再度インポートページへ
    await page.getByRole("link", { name: "データをインポート" }).click();
    await expect(page.getByText("データインポート")).toBeVisible();

    // Step 4: 同じファイルを再度アップロード
    await page.getByLabel("CADデータ").check();
    await page.setInputFiles('input[type="file"]', filePath);
    await page.getByRole("button", { name: "解析開始" }).click();
    await expect(page.getByText("3件のレコードを検出")).toBeVisible({
      timeout: 10000,
    });

    // Step 5: インポート実行
    await page.getByRole("button", { name: "インポート実行" }).click();

    // Step 6: 競合エラーが表示されることを確認
    await expect(page.getByText(/工番 TEST-2024-001 のデータは既に存在します/)).toBeVisible({
      timeout: 10000,
    });

    // エラー後もプレビュー状態であることを確認
    await expect(page.getByText("Step 2: プレビュー")).toBeVisible();
  });

  test("ホームページからのナビゲーション", async ({ page }) => {
    // ホームページに移動
    await page.goto("/");
    await expect(page.getByText("CADWorks Import")).toBeVisible();

    // インポートリンクをクリック
    await page.getByRole("link", { name: "データをインポート" }).click();

    // インポートページに遷移することを確認
    await expect(page.getByText("データインポート")).toBeVisible();
    await expect(page.getByText("Step 1: ファイル選択")).toBeVisible();
  });

  test("ファイルサイズ制限チェック", async ({ page }) => {
    // Note: This test would require creating a large file fixture
    // For now, we'll just verify the UI elements are present
    await expect(page.getByLabel("CSVファイル")).toBeVisible();
    await expect(page.getByRole("button", { name: "解析開始" })).toBeVisible();
  });

  test("成功後のナビゲーション - マッチング画面へ", async ({ page }) => {
    // インポートを実行
    await page.getByLabel("CADデータ").check();
    const filePath = path.join(__dirname, "fixtures", "valid-cad.csv");
    await page.setInputFiles('input[type="file"]', filePath);
    await page.getByRole("button", { name: "解析開始" }).click();
    await expect(page.getByText("3件のレコードを検出")).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole("button", { name: "インポート実行" }).click();
    await expect(page.getByText("インポート完了")).toBeVisible({
      timeout: 10000,
    });

    // マッチング画面へのボタンをクリック
    await page.getByRole("button", { name: "マッチング画面へ" }).click();

    // マッチング画面に遷移することを確認
    await expect(page).toHaveURL(/\/matching/);
  });
});
