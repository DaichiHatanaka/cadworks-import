import { describe, it, expect } from "vitest";
import { isLockExpired, canAcquireLock, makeLockExpiresAt, LOCK_TTL_SECONDS } from "./lock-logic";

const baseTime = new Date("2025-01-01T00:00:00Z");

describe("isLockExpired", () => {
  it("有効期限が現在時刻より前の場合はtrue", () => {
    const expiredAt = new Date(baseTime.getTime() - 1000);
    expect(isLockExpired(expiredAt, baseTime)).toBe(true);
  });

  it("有効期限が現在時刻と同じ場合はtrue（境界値）", () => {
    expect(isLockExpired(baseTime, baseTime)).toBe(true);
  });

  it("有効期限が現在時刻より後の場合はfalse", () => {
    const futureAt = new Date(baseTime.getTime() + 1000);
    expect(isLockExpired(futureAt, baseTime)).toBe(false);
  });
});

describe("canAcquireLock", () => {
  it("ロックレコードが存在しない（null）場合はtrueを返す", () => {
    expect(canAcquireLock(null, baseTime)).toBe(true);
  });

  it("ロックが失効している場合はtrueを返す", () => {
    const expiredLock = {
      expiresAt: new Date(baseTime.getTime() - 1000),
    };
    expect(canAcquireLock(expiredLock, baseTime)).toBe(true);
  });

  it("有効なロックが存在する場合はfalseを返す", () => {
    const activeLock = {
      expiresAt: new Date(baseTime.getTime() + 60_000),
    };
    expect(canAcquireLock(activeLock, baseTime)).toBe(false);
  });
});

describe("makeLockExpiresAt", () => {
  it("指定された現在時刻からLOCK_TTL_SECONDS後のDateを返す", () => {
    const result = makeLockExpiresAt(baseTime);
    const expected = new Date(baseTime.getTime() + LOCK_TTL_SECONDS * 1000);
    expect(result.getTime()).toBe(expected.getTime());
  });

  it("LOCK_TTL_SECONDSは120である", () => {
    expect(LOCK_TTL_SECONDS).toBe(120);
  });
});
