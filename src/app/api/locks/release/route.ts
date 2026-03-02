import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { jobLocks } from "@/db/schema";

const releaseSchema = z.object({
  jobNo: z.string().min(1),
  lockToken: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = releaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { jobNo, lockToken } = parsed.data;

  const db = getDb();

  // トークンが一致する場合のみ削除。不一致でも204を返す（冪等性確保）
  await db
    .delete(jobLocks)
    .where(and(eq(jobLocks.jobNo, jobNo), eq(jobLocks.lockToken, lockToken)));

  return NextResponse.json({ success: true });
}
