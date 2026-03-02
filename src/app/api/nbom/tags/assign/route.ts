import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { costItemTags, tagDefinitions, tagCategoryEnum } from "@/db/schema";

const assignSchema = z.object({
  costItemIds: z.array(z.string()).min(1),
  category: z.enum(tagCategoryEnum),
  value: z.string().min(1),
  jobNo: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = assignSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.errors },
        { status: 400 },
      );
    }

    const { costItemIds, category, value, jobNo } = validation.data;
    const db = getDb();

    // タグ定義が存在しなければ自動作成
    const existingDefs = await db.select().from(tagDefinitions);
    const defExists = existingDefs.some(
      (d) => d.jobNo === jobNo && d.category === category && d.value === value,
    );

    if (!defExists) {
      await db.insert(tagDefinitions).values({
        id: `tagdef-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        jobNo,
        category,
        value,
        sortOrder: 0,
      });
    }

    // 各アイテムにタグを付与（既存の重複はスキップ）
    const existing = await db.select().from(costItemTags);
    const existingSet = new Set(existing.map((t) => `${t.costItemId}:${t.category}:${t.value}`));

    const inserts: (typeof costItemTags.$inferInsert)[] = [];
    for (const itemId of costItemIds) {
      const key = `${itemId}:${category}:${value}`;
      if (!existingSet.has(key)) {
        inserts.push({
          id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          costItemId: itemId,
          category,
          value,
        });
      }
    }

    if (inserts.length > 0) {
      await db.insert(costItemTags).values(inserts);
    }

    return NextResponse.json({ assignedCount: inserts.length });
  } catch (error) {
    console.error("Tag assign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
