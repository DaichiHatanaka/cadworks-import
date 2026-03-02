import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { linkResults } from "@/db/schema";

// リクエストボディのバリデーションスキーマ
const savePairSchema = z.object({
  cadId: z.string(),
  tbomId: z.string().nullable(),
  status: z.enum(["unsaved"]),
});

const saveRequestSchema = z.object({
  jobNo: z.string().min(1, "工番は必須です"),
  pairs: z.array(savePairSchema),
});

export async function POST(request: NextRequest) {
  try {
    // リクエストボディの取得とバリデーション
    const body = await request.json();
    const validationResult = saveRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { jobNo, pairs } = validationResult.data;
    const db = getDb();

    // 未保存ペアの DB 反映（upsert）
    let savedCount = 0;
    for (const pair of pairs) {
      // ID を生成（CAD ID ベース）
      const linkId = `link-${pair.cadId}`;

      await db
        .insert(linkResults)
        .values({
          id: linkId,
          jobNo,
          cadId: pair.cadId,
          tbomId: pair.tbomId,
          status: "saved",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: linkResults.id,
          set: {
            tbomId: pair.tbomId,
            status: "saved",
            updatedAt: new Date(),
          },
        });

      savedCount++;
    }

    return NextResponse.json({ savedCount });
  } catch (error) {
    console.error("Save API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
