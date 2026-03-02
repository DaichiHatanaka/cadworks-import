import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import ExcelJS from "exceljs";
import { getDb } from "@/db";
import { linkResults, cwxData, tbomData } from "@/db/schema";

// クエリパラメータのバリデーションスキーマ
const exportQuerySchema = z.object({
  jobNo: z.string().min(1, "工番は必須です"),
});

export async function GET(request: NextRequest) {
  try {
    // クエリパラメータの取得とバリデーション
    const { searchParams } = new URL(request.url);
    const queryParams = {
      jobNo: searchParams.get("jobNo"),
    };

    const validationResult = exportQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid parameters",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { jobNo } = validationResult.data;
    const db = getDb();

    // 紐付け結果を CAD・TBOM データと共に取得
    const linkedData = await db
      .select({
        linkId: linkResults.id,
        status: linkResults.status,
        cadId: cwxData.id,
        cadListType: cwxData.listType,
        cadKikiNo: cwxData.kikiNo,
        cadKikiBame: cwxData.kikiBame,
        cadQtyOrd: cwxData.qtyOrd,
        cadShortSpec: cwxData.shortSpec,
        tbomId: tbomData.id,
        tbomListType: tbomData.listType,
        tbomKikiNo: tbomData.kikiNo,
        tbomKikiBame: tbomData.kikiBame,
        tbomQtyOrd: tbomData.qtyOrd,
        tbomShortSpec: tbomData.shortSpec,
      })
      .from(linkResults)
      .leftJoin(cwxData, eq(linkResults.cadId, cwxData.id))
      .leftJoin(tbomData, eq(linkResults.tbomId, tbomData.id))
      .where(eq(linkResults.jobNo, jobNo));

    if (linkedData.length === 0) {
      return NextResponse.json(
        { error: "指定された工番の紐付け結果が見つかりません" },
        { status: 404 },
      );
    }

    // Excel ワークブックの作成
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("紐付け結果");

    // ヘッダー行の設定
    const headers = [
      "ステータス",
      "CAD リストタイプ",
      "CAD 機器番号",
      "CAD 機器名称",
      "CAD 数量",
      "CAD 概略仕様",
      "T-BOM リストタイプ",
      "T-BOM 機器番号",
      "T-BOM 機器名称",
      "T-BOM 数量",
      "T-BOM 概略仕様",
    ];

    worksheet.addRow(headers);

    // ヘッダー行のスタイル設定
    const headerRow = worksheet.getRow(1);
    headerRow.font = { color: { argb: "FFFFFFFF" }, bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1976D2" }, // 青背景
    };

    // CAD 側と T-BOM 側のヘッダーラベルの色分け
    headerRow.getCell(2).font = { color: { argb: "FF1565C0" }, bold: true }; // CAD 側ラベル: 濃青
    headerRow.getCell(7).font = { color: { argb: "FF00695C" }, bold: true }; // T-BOM 側ラベル: 濃ティール

    // データ行の追加
    for (const row of linkedData) {
      const statusBadge = row.status === "saved" ? "保存済み" : "未保存";

      const dataRow = worksheet.addRow([
        statusBadge,
        row.cadListType || "",
        row.cadKikiNo || "",
        row.cadKikiBame || "",
        row.cadQtyOrd || "",
        row.cadShortSpec || "",
        row.tbomListType || "",
        row.tbomKikiNo || "",
        row.tbomKikiBame || "",
        row.tbomQtyOrd || "",
        row.tbomShortSpec || "",
      ]);

      // ステータスバッジの色設定
      if (row.status === "saved") {
        dataRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4CAF50" }, // 緑
        };
      } else {
        dataRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFC107" }, // 黄色
        };
      }

      // T-BOM 対応なし（追加）の場合、T-BOM 側セルをグレーアウト
      if (!row.tbomId) {
        for (let i = 7; i <= 11; i++) {
          dataRow.getCell(i).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE0E0E0" }, // グレー
          };
        }
      } else {
        // 差異セルのハイライト（CAD と T-BOM で値が異なるセル）
        if (row.cadKikiNo !== row.tbomKikiNo) {
          dataRow.getCell(3).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFA500" }, // オレンジ
          };
          dataRow.getCell(8).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFA500" },
          };
        }
        if (row.cadKikiBame !== row.tbomKikiBame) {
          dataRow.getCell(4).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFA500" },
          };
          dataRow.getCell(9).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFA500" },
          };
        }
        if (row.cadQtyOrd !== row.tbomQtyOrd) {
          dataRow.getCell(5).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFA500" },
          };
          dataRow.getCell(10).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFA500" },
          };
        }
        if (row.cadShortSpec !== row.tbomShortSpec) {
          dataRow.getCell(6).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFA500" },
          };
          dataRow.getCell(11).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFA500" },
          };
        }
      }
    }

    // カラム幅の調整
    worksheet.columns = [
      { width: 12 }, // ステータス
      { width: 15 }, // CAD リストタイプ
      { width: 20 }, // CAD 機器番号
      { width: 30 }, // CAD 機器名称
      { width: 10 }, // CAD 数量
      { width: 40 }, // CAD 概略仕様
      { width: 15 }, // T-BOM リストタイプ
      { width: 20 }, // T-BOM 機器番号
      { width: 30 }, // T-BOM 機器名称
      { width: 10 }, // T-BOM 数量
      { width: 40 }, // T-BOM 概略仕様
    ];

    // Excel ファイルをバッファに書き出し
    const buffer = await workbook.xlsx.writeBuffer();

    // レスポンスヘッダーの設定
    const headers_response = new Headers();
    headers_response.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    headers_response.set(
      "Content-Disposition",
      `attachment; filename="matching-result-${jobNo}.xlsx"`,
    );

    return new NextResponse(buffer, { headers: headers_response });
  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
