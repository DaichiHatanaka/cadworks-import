import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { cwxData, tbomData, linkResults } from "@/db/schema";
import { executeAutoLink } from "@/lib/matching";
import type { CwxRecord, TbomRecord, LinkedPair } from "@/lib/matching/types";

// リクエストパラメータのバリデーションスキーマ
const initQuerySchema = z.object({
  jobNo: z.string().min(1, "工番は必須です"),
  caseNo: z.string().min(1, "ケースは必須です"),
  constructionType: z.string().min(1, "施工区分は必須です"),
  listTypes: z.string().min(1, "リストタイプは必須です"),
});

export async function GET(request: NextRequest) {
  try {
    // クエリパラメータの取得とバリデーション
    const { searchParams } = new URL(request.url);
    const queryParams = {
      jobNo: searchParams.get("jobNo"),
      caseNo: searchParams.get("caseNo"),
      constructionType: searchParams.get("constructionType"),
      listTypes: searchParams.get("listTypes"),
    };

    const validationResult = initQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid parameters",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { jobNo, caseNo, constructionType, listTypes } = validationResult.data;
    const db = getDb();

    // CWX データの取得
    const cwxRecords = (await db
      .select()
      .from(cwxData)
      .where(eq(cwxData.jobNo, jobNo))) as CwxRecord[];

    if (cwxRecords.length === 0) {
      return NextResponse.json(
        { error: "指定された工番のデータが見つかりません" },
        { status: 404 },
      );
    }

    // TBOM データの取得
    const tbomRecords = (await db
      .select()
      .from(tbomData)
      .where(eq(tbomData.jobNo, jobNo))) as TbomRecord[];

    // 既存の紐付け結果を取得
    const existingLinks = await db.select().from(linkResults).where(eq(linkResults.jobNo, jobNo));

    // 既存の紐付け結果から保存済みペアを復元
    const savedPairs: LinkedPair[] = [];
    const cadIdsInLinks = new Set<string>();
    const tbomIdsInLinks = new Set<string>();

    for (const link of existingLinks) {
      const cadRecord = cwxRecords.find((c) => c.id === link.cadId);
      const tbomRecord = link.tbomId ? tbomRecords.find((t) => t.id === link.tbomId) : null;

      if (cadRecord) {
        savedPairs.push({
          id: link.id,
          cad: cadRecord,
          tbom: tbomRecord || null,
          status: link.status as "saved" | "unsaved",
        });
        cadIdsInLinks.add(link.cadId);
        if (link.tbomId) {
          tbomIdsInLinks.add(link.tbomId);
        }
      }
    }

    // 未紐付けデータを抽出
    const unlinkedCadRecords = cwxRecords.filter((c) => !cadIdsInLinks.has(c.id));
    const unlinkedTbomRecords = tbomRecords.filter((t) => !tbomIdsInLinks.has(t.id));

    // 自動紐付けロジックの実行（未紐付けデータに対して）
    const autoLinkResult = executeAutoLink(unlinkedCadRecords, unlinkedTbomRecords);

    // 保存済みペアと自動紐付け結果を統合
    const allLinkedPairs = [...savedPairs, ...autoLinkResult.linkedPairs];

    // 画面タイトルの生成（取込対象に応じた動的変更）
    const listTypeArray = listTypes.split(",");
    const screenTitle =
      listTypeArray.length === 1 ? `${listTypeArray[0]} データ紐付け` : "機器データ紐付け";

    // レスポンスの構築
    return NextResponse.json({
      header: {
        jobNo,
        caseNo,
        constructionType,
        screenTitle,
      },
      unlinkedCad: autoLinkResult.unlinkedCad,
      unlinkedTbom: autoLinkResult.unlinkedTbom,
      linkedPairs: allLinkedPairs,
      stats: {
        totalCadCount: cwxRecords.length,
        linkedCount: allLinkedPairs.length,
      },
    });
  } catch (error) {
    console.error("Init API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
