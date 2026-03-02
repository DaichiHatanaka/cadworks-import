import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { jobLocks } from "@/db/schema";
import { isLockExpired } from "@/lib/locks/lock-logic";

export async function GET(_request: Request, { params }: { params: Promise<{ jobNo: string }> }) {
  const { jobNo } = await params;

  if (!jobNo) {
    return NextResponse.json({ error: "jobNo is required" }, { status: 400 });
  }

  const db = getDb();

  const rows = await db.select().from(jobLocks).where(eq(jobLocks.jobNo, jobNo)).limit(1);

  const lock = rows[0];

  if (!lock) {
    return NextResponse.json({ locked: false });
  }

  const now = new Date();
  if (isLockExpired(lock.expiresAt, now)) {
    return NextResponse.json({ locked: false });
  }

  return NextResponse.json({
    locked: true,
    lockedBy: lock.lockedByUserName,
    lockedAt: lock.lockedAt,
  });
}
