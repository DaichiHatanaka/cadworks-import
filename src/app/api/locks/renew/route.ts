import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { jobLocks } from "@/db/schema";
import { makeLockExpiresAt } from "@/lib/locks/lock-logic";

const renewSchema = z.object({
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

  const parsed = renewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { jobNo, lockToken } = parsed.data;
  const now = new Date();
  const expiresAt = makeLockExpiresAt(now);

  const db = getDb();

  const result = await db
    .update(jobLocks)
    .set({ expiresAt })
    .where(and(eq(jobLocks.jobNo, jobNo), eq(jobLocks.lockToken, lockToken)));

  // Drizzle の rowCount で更新件数を確認
  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Lock token mismatch or lock not found" }, { status: 409 });
  }

  return NextResponse.json({ success: true });
}
