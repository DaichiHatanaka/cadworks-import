import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { costItems, tbomProductCatalog, selectionResults } from "@/db/schema";

const requestSchema = z.object({
  costItemId: z.string().min(1),
  productId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.errors },
        { status: 400 },
      );
    }

    const { costItemId, productId } = validation.data;
    const db = getDb();

    // 製品情報を取得
    const [product] = await db
      .select()
      .from(tbomProductCatalog)
      .where(eq(tbomProductCatalog.id, productId));

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // costItem を取得して quantity を得る
    const [item] = await db.select().from(costItems).where(eq(costItems.id, costItemId));

    if (!item) {
      return NextResponse.json({ error: "Cost item not found" }, { status: 404 });
    }

    // selection_results を upsert（既存を削除して新規挿入）
    await db.delete(selectionResults).where(eq(selectionResults.costItemId, costItemId));

    const resultId = `sr-manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await db.insert(selectionResults).values({
      id: resultId,
      costItemId,
      productId,
      status: "manual_override",
      candidateCount: 1,
      conditionLog: [
        {
          conditionNo: "MANUAL",
          conditionName: "手動選定",
          inputCount: 0,
          outputCount: 1,
          isCommon: false,
        },
      ],
    });

    // costItems を更新
    await db
      .update(costItems)
      .set({
        selectedProductId: productId,
        selectionStatus: "manual_override",
        maker: product.maker,
        makerModel: product.makerModel,
        unitPrice: product.unitPrice,
        amount: item.quantity * product.unitPrice,
        updatedAt: new Date(),
      })
      .where(eq(costItems.id, costItemId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Selection override error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
