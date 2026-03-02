import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { selectionResults } from "@/db/schema";

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

    const results = await db
      .select()
      .from(selectionResults)
      .where(eq(selectionResults.costItemId, costItemId));

    if (results.length === 0) {
      return NextResponse.json([]);
    }

    // 最新の結果を返す
    const latest = results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];

    return NextResponse.json(latest.conditionLog ?? []);
  } catch (error) {
    console.error("Selection log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
