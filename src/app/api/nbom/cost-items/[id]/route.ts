import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { costItems } from "@/db/schema";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  classification: z.string().nullable().optional(),
  subNumber: z.string().nullable().optional(),
  skidGroupNo: z.string().nullable().optional(),
  skidNo: z.string().nullable().optional(),
  equipmentNo: z.string().nullable().optional(),
  shortSpec: z.string().nullable().optional(),
  maker: z.string().nullable().optional(),
  makerModel: z.string().nullable().optional(),
  quantity: z.number().int().min(0).optional(),
  unitPrice: z.number().int().min(0).optional(),
  amount: z.number().int().min(0).optional(),
  weight: z.number().nullable().optional(),
  volume: z.number().nullable().optional(),
  elFlag: z.boolean().optional(),
  flowSheetNo: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  listType: z.string().nullable().optional(),
  folderId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  estimationStatus: z.enum(["unestimated", "in_progress", "estimated", "confirmed"]).optional(),
  procurement: z.string().nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = patchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.errors },
        { status: 400 },
      );
    }

    const data = validation.data;
    const db = getDb();

    // 存在確認
    const [existing] = await db.select().from(costItems).where(eq(costItems.id, id));

    if (!existing) {
      return NextResponse.json({ error: "原価項目が見つかりません" }, { status: 404 });
    }

    // 数量・単価が変更されたら金額を自動計算
    const qty = data.quantity ?? existing.quantity;
    const price = data.unitPrice ?? existing.unitPrice;
    const amount = data.amount ?? qty * price;

    await db
      .update(costItems)
      .set({
        ...data,
        amount,
        updatedAt: new Date(),
      })
      .where(eq(costItems.id, id));

    const [updated] = await db.select().from(costItems).where(eq(costItems.id, id));

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Cost item PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = getDb();

    const [existing] = await db.select().from(costItems).where(eq(costItems.id, id));

    if (!existing) {
      return NextResponse.json({ error: "原価項目が見つかりません" }, { status: 404 });
    }

    await db.delete(costItems).where(eq(costItems.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cost item DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
