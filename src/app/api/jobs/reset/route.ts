/**
 * POST /api/jobs/reset
 * 工番単位で全データをリセット（デモ用リフレッシュ）
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import {
  costItems,
  costItemFolders,
  linkResults,
  cwxData,
  tbomData,
  tagDefinitions,
  jobLocks,
} from "@/db/schema";

const resetRequestSchema = z.object({
  jobNo: z.string().min(1, "工番は必須です"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobNo } = resetRequestSchema.parse(body);

    const db = getDb();

    // FK 依存関係の順序で削除（子テーブルから先に）
    // selectionResults, costItemTags は onDelete: "cascade" で costItems と連動
    // Neon HTTP ドライバはトランザクション非対応のため個別クエリ

    const deletedCostItems = await db.delete(costItems).where(eq(costItems.jobNo, jobNo));

    const deletedFolders = await db.delete(costItemFolders).where(eq(costItemFolders.jobNo, jobNo));

    const deletedLinks = await db.delete(linkResults).where(eq(linkResults.jobNo, jobNo));

    const deletedCwx = await db.delete(cwxData).where(eq(cwxData.jobNo, jobNo));

    const deletedTbom = await db.delete(tbomData).where(eq(tbomData.jobNo, jobNo));

    const deletedTags = await db.delete(tagDefinitions).where(eq(tagDefinitions.jobNo, jobNo));

    const deletedLocks = await db.delete(jobLocks).where(eq(jobLocks.jobNo, jobNo));

    return NextResponse.json({
      success: true,
      jobNo,
      deletedCounts: {
        costItems: deletedCostItems.rowCount ?? 0,
        costItemFolders: deletedFolders.rowCount ?? 0,
        linkResults: deletedLinks.rowCount ?? 0,
        cwxData: deletedCwx.rowCount ?? 0,
        tbomData: deletedTbom.rowCount ?? 0,
        tagDefinitions: deletedTags.rowCount ?? 0,
        jobLocks: deletedLocks.rowCount ?? 0,
      },
    });
  } catch (error) {
    console.error("Reset error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: false,
        error: "リセット中にエラーが発生しました",
        message: error instanceof Error ? error.message : "予期しないエラー",
      },
      { status: 500 },
    );
  }
}
