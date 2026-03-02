import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, lt } from "drizzle-orm";
import { getDb } from "@/db";
import { jobLocks } from "@/db/schema";
import { canAcquireLock, makeLockExpiresAt } from "@/lib/locks/lock-logic";

const acquireSchema = z.object({
  jobNo: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(1),
  lockToken: z.string().min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = acquireSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { jobNo, userId, userName, lockToken } = parsed.data;
  const now = new Date();

  const db = getDb();

  // 失効済みロックを削除
  await db.delete(jobLocks).where(lt(jobLocks.expiresAt, now));

  // 現在のロック状態を確認
  const existing = await db.select().from(jobLocks).where(eq(jobLocks.jobNo, jobNo)).limit(1);

  const currentLock = existing[0] ?? null;

  if (!canAcquireLock(currentLock, now)) {
    return NextResponse.json(
      {
        error: "Lock already held",
        lockedBy: currentLock!.lockedByUserName,
        lockedAt: currentLock!.lockedAt,
      },
      { status: 409 },
    );
  }

  // 既存の失効ロック（削除後も残っていた場合）を念のため削除してから INSERT
  await db.delete(jobLocks).where(eq(jobLocks.jobNo, jobNo));

  const expiresAt = makeLockExpiresAt(now);

  await db.insert(jobLocks).values({
    jobNo,
    lockedByUserId: userId,
    lockedByUserName: userName,
    lockedAt: now,
    expiresAt,
    lockToken,
  });

  return NextResponse.json({ success: true });
}
