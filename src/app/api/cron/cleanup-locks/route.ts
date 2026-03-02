import { NextResponse } from "next/server";
import { lt } from "drizzle-orm";
import { getDb } from "@/db";
import { jobLocks } from "@/db/schema";

/**
 * Vercel Cron Job エンドポイント。
 * 有効期限切れのロックレコードを一括削除する。
 * vercel.json の crons 設定で定期実行する。
 */
export async function GET() {
  const now = new Date();
  const db = getDb();

  const result = await db.delete(jobLocks).where(lt(jobLocks.expiresAt, now));

  return NextResponse.json({
    deletedCount: result.rowCount ?? 0,
    cleanedAt: now.toISOString(),
  });
}
