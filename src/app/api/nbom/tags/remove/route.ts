import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { costItemTags, tagCategoryEnum } from "@/db/schema";

const removeSchema = z.object({
  costItemIds: z.array(z.string()).min(1),
  category: z.enum(tagCategoryEnum),
  value: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = removeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.errors },
        { status: 400 },
      );
    }

    const { costItemIds, category, value } = validation.data;
    const db = getDb();

    for (const itemId of costItemIds) {
      await db
        .delete(costItemTags)
        .where(
          and(
            eq(costItemTags.costItemId, itemId),
            eq(costItemTags.category, category),
            eq(costItemTags.value, value),
          ),
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tag remove error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
