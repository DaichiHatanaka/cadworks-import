import { NextRequest, NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { tbomData } from "@/db/schema";
import type { SplitExecuteRequest, SplitExecuteResponse } from "@/lib/splitting/types";

export async function POST(req: NextRequest) {
  let body: SplitExecuteRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { jobNo, items } = body;
  if (!jobNo || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "jobNo and items are required" }, { status: 400 });
  }

  const db = getDb();

  // 元レコードを取得（バリデーション兼バックアップ）
  const ids = items.map((item) => item.id);
  const originals = await db.select().from(tbomData).where(inArray(tbomData.id, ids));

  if (originals.length !== ids.length) {
    return NextResponse.json({ error: "Some records not found" }, { status: 404 });
  }

  // バックアップログ
  console.log("[splitting] Pre-split records:", JSON.stringify(originals, null, 2));

  const originalMap = new Map(originals.map((r) => [r.id, r]));

  // 元レコード削除 → 分割後レコード挿入
  for (const item of items) {
    const original = originalMap.get(item.id);
    if (!original) continue;

    // 元レコード削除
    await db.delete(tbomData).where(eq(tbomData.id, item.id));

    // 分割後レコードを挿入
    const splitRows = item.kikiNos.map((kikiNo, i) => ({
      id: `${item.id}-${i + 1}`,
      jobNo: original.jobNo,
      listType: original.listType,
      kid: original.kid,
      idCount: String(i + 1),
      kikiNo,
      kikiBame: original.kikiBame,
      qtyOrd: "1",
      shortSpec: original.shortSpec,
    }));

    await db.insert(tbomData).values(splitRows);
  }

  const splitCount = items.reduce((sum, item) => sum + item.kikiNos.length, 0);

  const response: SplitExecuteResponse = {
    success: true,
    splitCount,
  };

  return NextResponse.json(response);
}
