import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import {
  cwxData,
  tbomData,
  linkResults,
  listTypeMaster,
  costItems,
  costItemFolders,
} from "@/db/schema";

const querySchema = z.object({
  jobNo: z.string().min(1, "工番は必須です"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validation = querySchema.safeParse({
      jobNo: searchParams.get("jobNo"),
    });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.errors },
        { status: 400 },
      );
    }

    const { jobNo } = validation.data;
    const db = getDb();

    // 既に cost_items が存在するか確認
    const existing = await db.select().from(costItems).where(eq(costItems.jobNo, jobNo)).limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ status: "existing", jobNo });
    }

    // link_results から cost_items を自動生成
    const links = await db
      .select()
      .from(linkResults)
      .where(and(eq(linkResults.jobNo, jobNo), eq(linkResults.status, "saved")));

    if (links.length === 0) {
      return NextResponse.json(
        { error: "紐付け済みデータが見つかりません。先にマッチングを完了してください。" },
        { status: 404 },
      );
    }

    // CAD・T-BOM データを取得
    const cwxRecords = await db.select().from(cwxData).where(eq(cwxData.jobNo, jobNo));
    const cwxMap = new Map(cwxRecords.map((r) => [r.id, r]));

    const tbomRecords = await db.select().from(tbomData).where(eq(tbomData.jobNo, jobNo));
    const tbomMap = new Map(tbomRecords.map((r) => [r.id, r]));

    // リストタイプマスターを取得
    const masters = await db.select().from(listTypeMaster);
    const masterMap = new Map(masters.map((m) => [m.listType, m]));

    // リストタイプ別にフォルダを自動作成
    const listTypesUsed = new Set<string>();
    for (const link of links) {
      const cad = cwxMap.get(link.cadId);
      if (cad) listTypesUsed.add(cad.listType);
    }

    const folderMap = new Map<string, string>(); // listType → folderId
    const folderInserts: {
      id: string;
      jobNo: string;
      name: string;
      parentId: string | null;
      sortOrder: number;
    }[] = [];

    let sortIdx = 0;
    for (const lt of listTypesUsed) {
      const master = masterMap.get(lt);
      const folderId = `folder-${jobNo}-${lt}`;
      folderInserts.push({
        id: folderId,
        jobNo,
        name: master?.listName ?? lt,
        parentId: null,
        sortOrder: sortIdx++,
      });
      folderMap.set(lt, folderId);
    }

    if (folderInserts.length > 0) {
      await db.insert(costItemFolders).values(folderInserts);
    }

    // cost_items を生成
    const itemInserts: (typeof costItems.$inferInsert)[] = [];
    let itemSort = 0;

    for (const link of links) {
      const cad = cwxMap.get(link.cadId);
      if (!cad) continue;

      const tbom = link.tbomId ? tbomMap.get(link.tbomId) : null;
      const qty = parseInt(tbom?.qtyOrd ?? cad.qtyOrd, 10) || 1;

      itemInserts.push({
        id: `ci-${link.id}`,
        jobNo,
        name: tbom?.kikiBame ?? cad.kikiBame,
        classification: null,
        subNumber: null,
        equipmentNo: cad.kikiNo || null,
        shortSpec: cad.shortSpec ?? tbom?.shortSpec ?? null,
        maker: null,
        makerModel: null,
        quantity: qty,
        unitPrice: 0,
        amount: 0,
        listType: cad.listType,
        folderId: folderMap.get(cad.listType) ?? null,
        sortOrder: itemSort++,
        estimationStatus: "unestimated",
        sourceType: "link_result",
        linkResultId: link.id,
      });
    }

    if (itemInserts.length > 0) {
      await db.insert(costItems).values(itemInserts);
    }

    return NextResponse.json({
      status: "created",
      jobNo,
      itemCount: itemInserts.length,
      folderCount: folderInserts.length,
    });
  } catch (error) {
    console.error("N-BOM init error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
