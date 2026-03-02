import { NextRequest, NextResponse } from "next/server";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import {
  costItems,
  tbomProductCatalog,
  tbomProductAttributes,
  selectionConditionDefs,
  selectionResults,
} from "@/db/schema";
import { parseShortSpec } from "@/lib/selection/spec-parser";
import { executeSelection } from "@/lib/selection/selection-engine";
import type { ProductWithAttributes, ConditionDef, SelectionSummary } from "@/lib/selection/types";

const requestSchema = z.object({
  jobNo: z.string().min(1),
  costItemIds: z.array(z.string()).optional(),
});

/**
 * 製品カタログ行 + 属性テーブルから ProductWithAttributes を構築
 */
function buildProductsWithAttributes(
  products: (typeof tbomProductCatalog.$inferSelect)[],
  attributes: (typeof tbomProductAttributes.$inferSelect)[],
): ProductWithAttributes[] {
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

  return products.map((p) => {
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
}

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

    const { jobNo, costItemIds } = validation.data;
    const db = getDb();

    // 対象 costItems を取得
    let targetItems: (typeof costItems.$inferSelect)[];
    if (costItemIds && costItemIds.length > 0) {
      targetItems = await db
        .select()
        .from(costItems)
        .where(and(eq(costItems.jobNo, jobNo), inArray(costItems.id, costItemIds)));
    } else {
      // pending のもの全て
      targetItems = await db
        .select()
        .from(costItems)
        .where(and(eq(costItems.jobNo, jobNo), eq(costItems.selectionStatus, "pending")));
    }

    if (targetItems.length === 0) {
      return NextResponse.json({
        results: [],
        summary: { total: 0, selected: 0, unestimated: 0, multipleCandidates: 0 },
      });
    }

    // listType 別に製品カタログと条件を一括取得
    const listTypes = [...new Set(targetItems.map((i) => i.listType).filter(Boolean))] as string[];

    // 全製品カタログ取得
    const allProducts =
      listTypes.length > 0
        ? await db
            .select()
            .from(tbomProductCatalog)
            .where(inArray(tbomProductCatalog.listType, listTypes))
        : [];

    // 全属性取得
    const productIds = allProducts.map((p) => p.id);
    const allAttributes =
      productIds.length > 0
        ? await db
            .select()
            .from(tbomProductAttributes)
            .where(inArray(tbomProductAttributes.productId, productIds))
        : [];

    // 条件定義取得
    const allConditions =
      listTypes.length > 0
        ? await db
            .select()
            .from(selectionConditionDefs)
            .where(inArray(selectionConditionDefs.listType, listTypes))
        : [];

    // listType 別にグループ化
    const productsByListType = new Map<string, ProductWithAttributes[]>();
    for (const lt of listTypes) {
      const ltProducts = allProducts.filter((p) => p.listType === lt);
      const ltProductIds = new Set(ltProducts.map((p) => p.id));
      const ltAttrs = allAttributes.filter((a) => ltProductIds.has(a.productId));
      productsByListType.set(lt, buildProductsWithAttributes(ltProducts, ltAttrs));
    }

    const conditionsByListType = new Map<string, ConditionDef[]>();
    for (const lt of listTypes) {
      conditionsByListType.set(
        lt,
        allConditions
          .filter((c) => c.listType === lt)
          .map((c) => ({
            conditionNo: c.conditionNo,
            sortOrder: c.sortOrder,
            isCommon: c.isCommon,
            config: (c.config as Record<string, unknown>) ?? null,
          })),
      );
    }

    // 各 costItem に対して選定実行
    const summary: SelectionSummary = {
      total: targetItems.length,
      selected: 0,
      unestimated: 0,
      multipleCandidates: 0,
    };

    const results: {
      costItemId: string;
      status: string;
      candidateCount: number;
      selectedProductName: string | null;
    }[] = [];

    for (const item of targetItems) {
      if (!item.listType) {
        summary.unestimated++;
        results.push({
          costItemId: item.id,
          status: "unestimated",
          candidateCount: 0,
          selectedProductName: null,
        });
        continue;
      }

      const cadAttrs = parseShortSpec(item.shortSpec);
      const candidates = productsByListType.get(item.listType) ?? [];
      const conditions = conditionsByListType.get(item.listType) ?? [];

      const output = executeSelection({
        cadAttributes: cadAttrs,
        candidates,
        conditionSequence: conditions,
      });

      // 選定結果を保存
      const resultId = `sr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await db
        .insert(selectionResults)
        .values({
          id: resultId,
          costItemId: item.id,
          productId: output.selectedProduct?.id ?? null,
          status: output.status,
          candidateCount: output.candidateCount,
          conditionLog: output.conditionLog,
        })
        .onConflictDoNothing();

      // costItems を更新
      const selectionStatus =
        output.status === "selected" ? ("selected" as const) : ("unestimated" as const);

      const updateData: Record<string, unknown> = {
        selectionStatus,
        selectedProductId: output.selectedProduct?.id ?? null,
        updatedAt: new Date(),
      };

      // 選定された場合、maker/makerModel/unitPrice/amount を反映
      if (output.selectedProduct) {
        updateData.maker = output.selectedProduct.maker;
        updateData.makerModel = output.selectedProduct.makerModel;
        updateData.unitPrice = output.selectedProduct.unitPrice;
        updateData.amount = item.quantity * output.selectedProduct.unitPrice;
      }

      await db.update(costItems).set(updateData).where(eq(costItems.id, item.id));

      // サマリー集計
      if (output.status === "selected") summary.selected++;
      else if (output.status === "unestimated") summary.unestimated++;
      else if (output.status === "multiple_candidates") summary.multipleCandidates++;

      results.push({
        costItemId: item.id,
        status: output.status,
        candidateCount: output.candidateCount,
        selectedProductName: output.selectedProduct?.productName ?? null,
      });
    }

    return NextResponse.json({ results, summary });
  } catch (error) {
    console.error("Selection execute error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
