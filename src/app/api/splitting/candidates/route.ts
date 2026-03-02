import { NextRequest, NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { tbomData } from "@/db/schema";
import { canAutoSplit, parseKikiNo, SPLIT_TARGET_LIST_TYPES } from "@/lib/splitting/split-logic";
import type { SplitCandidatesResponse } from "@/lib/splitting/types";

export async function GET(req: NextRequest) {
  const jobNo = req.nextUrl.searchParams.get("jobNo");
  if (!jobNo) {
    return NextResponse.json({ error: "jobNo is required" }, { status: 400 });
  }

  const db = getDb();

  // 対象リストタイプのレコードを取得
  const rows = await db
    .select()
    .from(tbomData)
    .where(inArray(tbomData.listType, [...SPLIT_TARGET_LIST_TYPES]));

  // 工番フィルタ + qtyOrd >= 2 フィルタ（JS側）
  const candidates = rows
    .filter((row) => row.jobNo === jobNo && parseInt(row.qtyOrd, 10) >= 2)
    .map((row) => {
      const auto = canAutoSplit(row.kikiNo, row.qtyOrd);
      const parsed = auto ? parseKikiNo(row.kikiNo) : null;
      return {
        id: row.id,
        listType: row.listType,
        kikiNo: row.kikiNo,
        kikiBame: row.kikiBame,
        qtyOrd: row.qtyOrd,
        shortSpec: row.shortSpec,
        canAutoSplit: auto,
        parsedKikiNos: parsed,
      };
    });

  const autoCount = candidates.filter((c) => c.canAutoSplit).length;

  const response: SplitCandidatesResponse = {
    candidates,
    stats: {
      total: candidates.length,
      autoCount,
      manualCount: candidates.length - autoCount,
    },
  };

  return NextResponse.json(response);
}
