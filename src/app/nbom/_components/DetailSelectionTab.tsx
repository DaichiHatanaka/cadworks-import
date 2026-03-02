"use client";

import { useState, useEffect, useCallback } from "react";
import type { CostItem } from "@/lib/nbom/types";
import type { ConditionLogEntry, ProductWithAttributes } from "@/lib/selection/types";
import SelectionStatusBadge from "./SelectionStatusBadge";

interface DetailSelectionTabProps {
  item: CostItem;
  onOverrideSelection: (costItemId: string, productId: string) => void;
}

export default function DetailSelectionTab({ item, onOverrideSelection }: DetailSelectionTabProps) {
  const [conditionLog, setConditionLog] = useState<ConditionLogEntry[]>([]);
  const [candidates, setCandidates] = useState<ProductWithAttributes[]>([]);
  const [loadingLog, setLoadingLog] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // 条件ログ取得
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setLoadingLog(true);
    });
    fetch(`/api/selection/log?costItemId=${encodeURIComponent(item.id)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled) setConditionLog(data);
      })
      .finally(() => {
        if (!cancelled) setLoadingLog(false);
      });
    return () => {
      cancelled = true;
    };
  }, [item.id, item.selectionStatus]);

  // 候補一覧取得
  const loadCandidates = useCallback(() => {
    setLoadingCandidates(true);
    fetch(`/api/selection/candidates?costItemId=${encodeURIComponent(item.id)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setCandidates)
      .finally(() => setLoadingCandidates(false));
  }, [item.id]);

  return (
    <div className="space-y-4 p-4">
      {/* 選定ステータス */}
      <div>
        <span className="mb-1 block text-[10px] font-medium tracking-wider text-gray-400 uppercase">
          選定ステータス
        </span>
        <SelectionStatusBadge status={item.selectionStatus} />
      </div>

      {/* 選定結果 */}
      {item.selectionStatus === "selected" || item.selectionStatus === "manual_override" ? (
        <div className="rounded-lg bg-gray-50 p-3">
          <span className="mb-2 block text-[10px] font-medium tracking-wider text-gray-400 uppercase">
            選定製品
          </span>
          <div className="space-y-1 text-xs">
            {item.maker && (
              <div className="flex justify-between">
                <span className="text-gray-500">メーカー</span>
                <span className="font-medium">{item.maker}</span>
              </div>
            )}
            {item.makerModel && (
              <div className="flex justify-between">
                <span className="text-gray-500">型番</span>
                <span className="font-medium">{item.makerModel}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">単価</span>
              <span className="font-medium">{item.unitPrice.toLocaleString()}円</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* 条件ログ */}
      <div>
        <span className="mb-2 block text-[10px] font-medium tracking-wider text-gray-400 uppercase">
          選定条件ログ
        </span>
        {loadingLog ? (
          <p className="text-xs text-gray-400">読み込み中...</p>
        ) : conditionLog.length === 0 ? (
          <p className="text-xs text-gray-400">ログなし</p>
        ) : (
          <div className="space-y-1">
            {conditionLog.map((entry, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded bg-gray-50 px-2 py-1 text-[11px]"
              >
                <span className="w-8 shrink-0 font-mono text-gray-400">{entry.conditionNo}</span>
                <span className="min-w-0 flex-1 truncate text-gray-700">{entry.conditionName}</span>
                <span className="shrink-0 text-gray-500 tabular-nums">
                  {entry.inputCount} → {entry.outputCount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 候補一覧（手動選定用） */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">
            製品候補
          </span>
          <button
            onClick={loadCandidates}
            className="rounded px-2 py-0.5 text-[10px] font-medium text-blue-600 hover:bg-blue-50"
          >
            候補を表示
          </button>
        </div>
        {loadingCandidates ? (
          <p className="text-xs text-gray-400">読み込み中...</p>
        ) : candidates.length > 0 ? (
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {candidates.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded border border-gray-100 bg-white px-2 py-1.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-gray-900">{p.productName}</div>
                  <div className="text-[10px] text-gray-500">
                    {p.maker} {p.makerModel}
                  </div>
                  <div className="text-[10px] text-gray-500">{p.unitPrice.toLocaleString()}円</div>
                </div>
                <button
                  onClick={() => onOverrideSelection(item.id, p.id)}
                  className="ml-2 shrink-0 rounded bg-blue-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-blue-700"
                >
                  選定
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
