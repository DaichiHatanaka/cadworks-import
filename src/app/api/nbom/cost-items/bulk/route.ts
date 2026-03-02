import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { costItems } from "@/db/schema";

const bulkPatchSchema = z.object({
  ids: z.array(z.string()).min(1, "対象IDが必要です"),
  updates: z.object({
    subNumber: z.string().nullable().optional(),
    skidGroupNo: z.string().nullable().optional(),
    skidNo: z.string().nullable().optional(),
    equipmentNo: z.string().nullable().optional(),
    quantity: z.number().int().min(0).optional(),
    procurement: z.string().nullable().optional(),
    elFlag: z.boolean().optional(),
    folderId: z.string().nullable().optional(),
    estimationStatus: z.enum(["unestimated", "in_progress", "estimated", "confirmed"]).optional(),
  }),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = bulkPatchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.errors },
        { status: 400 },
      );
    }

    const { ids, updates } = validation.data;
    const db = getDb();

    let updatedCount = 0;
    for (const id of ids) {
      const [existing] = await db.select().from(costItems).where(eq(costItems.id, id));

      if (!existing) continue;

      const qty = updates.quantity ?? existing.quantity;
      const amount = qty * existing.unitPrice;

      await db
        .update(costItems)
        .set({
          ...updates,
          amount: updates.quantity !== undefined ? amount : undefined,
          updatedAt: new Date(),
        })
        .where(eq(costItems.id, id));

      updatedCount++;
    }

    return NextResponse.json({ updatedCount });
  } catch (error) {
    console.error("Bulk PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
