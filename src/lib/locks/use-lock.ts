"use client";

import { useState, useCallback, useEffect, useRef } from "react";

/** useLock の初期化パラメータ */
export interface UseLockOptions {
  jobNo: string;
  userId: string;
  userName: string;
  onLockLost?: () => void;
}

/** useLock の返り値 */
export interface UseLockReturn {
  isLocked: boolean;
  lockInfo: { lockedBy: string; lockedAt: Date } | null;
  lockToken: string | null;
  acquire: () => Promise<boolean>;
  release: () => Promise<void>;
}

/**
 * 工番単位のロック管理を行うカスタムフック
 */
export function useLock(options: UseLockOptions): UseLockReturn {
  const { jobNo, userId, userName, onLockLost } = options;

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockInfo, setLockInfo] = useState<{
    lockedBy: string;
    lockedAt: Date;
  } | null>(null);

  const lockTokenRef = useRef<string | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * ロック取得
   */
  const acquire = useCallback(async (): Promise<boolean> => {
    try {
      const lockToken = `${userId}-${Date.now()}-${Math.random()}`;
      lockTokenRef.current = lockToken;

      const response = await fetch("/api/locks/acquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobNo,
          userId,
          userName,
          lockToken,
        }),
      });

      if (response.ok) {
        setIsLocked(true);
        setLockInfo(null);
        startHeartbeat();
        return true;
      } else if (response.status === 409) {
        // 他ユーザーが編集中
        const data = await response.json();
        setIsLocked(false);
        setLockInfo({
          lockedBy: data.lockedBy,
          lockedAt: new Date(data.lockedAt),
        });
        return false;
      } else {
        throw new Error("Failed to acquire lock");
      }
    } catch (error) {
      console.error("Lock acquisition failed:", error);
      return false;
    }
  }, [jobNo, userId, userName]);

  /**
   * ロック更新（ハートビート）
   */
  const renewLock = useCallback(async () => {
    if (!lockTokenRef.current) return;

    try {
      const response = await fetch("/api/locks/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobNo,
          lockToken: lockTokenRef.current,
        }),
      });

      if (!response.ok) {
        // ハートビート失敗 → ロック失効
        setIsLocked(false);
        stopHeartbeat();
        if (onLockLost) {
          onLockLost();
        }
      }
    } catch (error) {
      console.error("Lock renewal failed:", error);
      setIsLocked(false);
      stopHeartbeat();
      if (onLockLost) {
        onLockLost();
      }
    }
  }, [jobNo, onLockLost]);

  /**
   * ハートビート開始（60秒間隔）
   */
  const startHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }

    heartbeatTimerRef.current = setInterval(() => {
      void renewLock();
    }, 60000); // 60秒
  }, [renewLock]);

  /**
   * ハートビート停止
   */
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  /**
   * ロック解放
   */
  const release = useCallback(async () => {
    if (!lockTokenRef.current) return;

    stopHeartbeat();

    try {
      const response = await fetch("/api/locks/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobNo,
          lockToken: lockTokenRef.current,
        }),
      });

      if (response.ok) {
        setIsLocked(false);
        lockTokenRef.current = null;
      }
    } catch (error) {
      console.error("Lock release failed:", error);
    }
  }, [jobNo, stopHeartbeat]);

  /**
   * sendBeacon または fetch でロック解放を試行
   */
  const releaseWithBeacon = useCallback(() => {
    if (!lockTokenRef.current) return;

    const data = JSON.stringify({
      jobNo,
      lockToken: lockTokenRef.current,
    });

    // sendBeacon を試行
    const beaconSent = navigator.sendBeacon("/api/locks/release", data);

    // sendBeacon が失敗した場合は keepalive fetch
    if (!beaconSent) {
      fetch("/api/locks/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
        keepalive: true,
      })
        .then(() => {
          // Success
        })
        .catch((error) => {
          console.error("Lock release beacon failed:", error);
        });
    }
  }, [jobNo]);

  /**
   * visibilitychange / pagehide でロック解放
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && isLocked) {
        releaseWithBeacon();
      }
    };

    const handlePageHide = () => {
      if (isLocked) {
        releaseWithBeacon();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [isLocked, releaseWithBeacon]);

  /**
   * アンマウント時にロック解放
   */
  useEffect(() => {
    return () => {
      if (isLocked) {
        stopHeartbeat();
        releaseWithBeacon();
      }
    };
  }, [isLocked, stopHeartbeat, releaseWithBeacon]);

  return {
    isLocked,
    lockInfo,
    lockToken: lockTokenRef.current,
    acquire,
    release,
  };
}
