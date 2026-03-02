import { NextRequest, NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { costItems, tbomProductCatalog, tbomProductAttributes } from "@/db/schema";
import type { ProductWithAttributes } from "@/lib/selection/types";

const querySchema = z.object({
  costItemId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validation = querySchema.safeParse({
      costItemId: searchParams.get("costItemId"),
    });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.errors },
        { status: 400 },
      );
    }

    const { costItemId } = validation.data;
    const db = getDb();

    // costItem の listType を取得
    const [item] = await db
      .select({ listType: costItems.listType })
      .from(costItems)
      .where(eq(costItems.id, costItemId));

    if (!item?.listType) {
      return NextResponse.json([]);
    }

    // 同じ listType の製品を取得
    const products = await db
      .select()
      .from(tbomProductCatalog)
      .where(eq(tbomProductCatalog.listType, item.listType));

    if (products.length === 0) {
      return NextResponse.json([]);
    }

    // 属性取得
    const productIds = products.map((p) => p.id);
    const attributes = await db
      .select()
      .from(tbomProductAttributes)
      .where(inArray(tbomProductAttributes.productId, productIds));

    // ProductWithAttributes 構築
    const attrMap = new Map<
      string,
      { attrs: Record<string, string>; numericAttrs: Record<string, number> }
    >();
    for (const attr of attributes) {
      if (!attrMap.has(attr.productId)) {
        attrMap.set(attr.productId, { attrs: {}, numericAttrs: {} });
      }
      const entry = attrMap.get(attr.productId)!;
      entry.attrs[attr.attrKey] = attr.attrValue;
      if (attr.numericValue != null) {
        entry.numericAttrs[attr.attrKey] = attr.numericValue;
      }
    }

    const result: ProductWithAttributes[] = products.map((p) => {
      const attrEntry = attrMap.get(p.id) ?? { attrs: {}, numericAttrs: {} };
      return {
        id: p.id,
        listType: p.listType,
        productName: p.productName,
        maker: p.maker,
        makerModel: p.makerModel,
        unitPrice: p.unitPrice,
        vendorListChecked: p.vendorListChecked,
        recommended: p.recommended,
        weight: p.weight,
        volume: p.volume,
        attrs: attrEntry.attrs,
        numericAttrs: attrEntry.numericAttrs,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Selection candidates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
