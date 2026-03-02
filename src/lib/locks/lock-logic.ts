/** ロック TTL（秒）。設計書仕様: 120秒 */
export const LOCK_TTL_SECONDS = 120;

/** ロックが失効しているか判定する（純粋関数） */
export function isLockExpired(expiresAt: Date, now: Date): boolean {
  return expiresAt <= now;
}

/** ロック取得可能かを判定する（純粋関数） */
export function canAcquireLock(existingLock: { expiresAt: Date } | null, now: Date): boolean {
  if (existingLock === null) return true;
  return isLockExpired(existingLock.expiresAt, now);
}

/** 現在時刻から LOCK_TTL_SECONDS 後の有効期限 Date を生成する */
export function makeLockExpiresAt(now: Date): Date {
  return new Date(now.getTime() + LOCK_TTL_SECONDS * 1000);
}
