import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { costItems, costItemTags } from "@/db/schema";

const getSchema = z.object({
  jobNo: z.string().min(1, "工番は必須です"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validation = getSchema.safeParse({
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

    const items = await db.select().from(costItems).where(eq(costItems.jobNo, jobNo));

    // タグを一括取得
    const itemIds = items.map((i) => i.id);
    let tags: (typeof costItemTags.$inferSelect)[] = [];
    if (itemIds.length > 0) {
      tags = await db.select().from(costItemTags).where(eq(costItemTags.costItemId, itemIds[0]));

      // 全アイテムのタグを取得（効率的な方法）
      if (itemIds.length > 1) {
        const allTags = await db.select().from(costItemTags);
        const itemIdSet = new Set(itemIds);
        tags = allTags.filter((t) => itemIdSet.has(t.costItemId));
      }
    }

    // タグをアイテムに結合
    const tagMap = new Map<string, typeof tags>();
    for (const tag of tags) {
      if (!tagMap.has(tag.costItemId)) tagMap.set(tag.costItemId, []);
      tagMap.get(tag.costItemId)!.push(tag);
    }

    const result = items.map((item) => ({
      ...item,
      tags: tagMap.get(item.id) ?? [],
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cost items GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createSchema = z.object({
  jobNo: z.string().min(1),
  name: z.string().min(1),
  classification: z.string().nullable().optional(),
  subNumber: z.string().nullable().optional(),
  equipmentNo: z.string().nullable().optional(),
  shortSpec: z.string().nullable().optional(),
  maker: z.string().nullable().optional(),
  makerModel: z.string().nullable().optional(),
  quantity: z.number().int().min(0).default(1),
  unitPrice: z.number().int().min(0).default(0),
  listType: z.string().nullable().optional(),
  folderId: z.string().nullable().optional(),
  procurement: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.errors },
        { status: 400 },
      );
    }

    const data = validation.data;
    const db = getDb();

    const id = `ci-manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const amount = data.quantity * data.unitPrice;

    await db.insert(costItems).values({
      id,
      jobNo: data.jobNo,
      name: data.name,
      classification: data.classification ?? null,
      subNumber: data.subNumber ?? null,
      equipmentNo: data.equipmentNo ?? null,
      shortSpec: data.shortSpec ?? null,
      maker: data.maker ?? null,
      makerModel: data.makerModel ?? null,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      amount,
      listType: data.listType ?? null,
      folderId: data.folderId ?? null,
      sortOrder: 0,
      estimationStatus: "unestimated",
      sourceType: "manual",
      procurement: data.procurement ?? null,
    });

    const [created] = await db.select().from(costItems).where(eq(costItems.id, id));

    return NextResponse.json({ ...created, tags: [] }, { status: 201 });
  } catch (error) {
    console.error("Cost items POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
