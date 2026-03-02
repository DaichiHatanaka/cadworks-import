import { NextRequest, NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { tbomProductCatalog, tbomProductAttributes } from "@/db/schema";
import type { ProductWithAttributes } from "@/lib/selection/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listType = searchParams.get("listType");

    const db = getDb();

    const products = listType
      ? await db.select().from(tbomProductCatalog).where(eq(tbomProductCatalog.listType, listType))
      : await db.select().from(tbomProductCatalog);

    if (products.length === 0) {
      return NextResponse.json([]);
    }

    // 属性取得
    const productIds = products.map((p) => p.id);
    const attributes = await db
      .select()
      .from(tbomProductAttributes)
      .where(inArray(tbomProductAttributes.productId, productIds));

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
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
