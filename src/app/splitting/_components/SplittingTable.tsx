"use client";

import { useState, useCallback, Fragment } from "react";
import { cn } from "@/lib/utils";
import { canAutoSplit, parseKikiNo } from "@/lib/splitting/split-logic";
import { StatusBadge } from "./StatusBadge";
import type { SplitCandidate, SplitStatus } from "@/lib/splitting/types";

interface RowState {
  editedKikiNo: string;
  isDone: boolean;
}

interface SplittingTableProps {
  candidates: SplitCandidate[];
  onSplit: (id: string, kikiNos: string[]) => Promise<void>;
}

export function SplittingTable({ candidates, onSplit }: SplittingTableProps) {
  const [rowStates, setRowStates] = useState<Record<string, RowState>>(() => {
    const init: Record<string, RowState> = {};
    for (const c of candidates) {
      init[c.id] = { editedKikiNo: c.kikiNo, isDone: false };
    }
    return init;
  });
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const getStatus = useCallback(
    (candidate: SplitCandidate): SplitStatus => {
      const state = rowStates[candidate.id];
      if (!state) return candidate.canAutoSplit ? "auto" : "manual";
      if (state.isDone) return "done";
      const auto = canAutoSplit(state.editedKikiNo, candidate.qtyOrd);
      return auto ? "auto" : "manual";
    },
    [rowStates],
  );

  const getParsed = useCallback(
    (candidate: SplitCandidate): string[] | null => {
      const state = rowStates[candidate.id];
      const kikiNo = state?.editedKikiNo ?? candidate.kikiNo;
      return parseKikiNo(kikiNo);
    },
    [rowStates],
  );

  const handleEdit = (id: string, value: string) => {
    setRowStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], editedKikiNo: value },
    }));
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSplit = async (candidate: SplitCandidate) => {
    const state = rowStates[candidate.id];
    const kikiNo = state?.editedKikiNo ?? candidate.kikiNo;
    const parsed = parseKikiNo(kikiNo);
    if (!parsed) return;

    setLoadingIds((prev) => new Set(prev).add(candidate.id));
    try {
      await onSplit(candidate.id, parsed);
      setRowStates((prev) => ({
        ...prev,
        [candidate.id]: { ...prev[candidate.id], isDone: true },
      }));
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(candidate.id);
        return next;
      });
    }
  };

  return (
    <div className="overflow-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-[#1976D2] text-white">
          <tr>
            <th className="px-4 py-2 text-left font-medium">リストタイプ</th>
            <th className="px-4 py-2 text-left font-medium">機器番号</th>
            <th className="px-4 py-2 text-left font-medium">機器名称</th>
            <th className="px-4 py-2 text-center font-medium">数量</th>
            <th className="px-4 py-2 text-left font-medium">ステータス</th>
            <th className="px-4 py-2 text-left font-medium">アクション</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => {
            const state = rowStates[candidate.id];
            const status = getStatus(candidate);
            const isDone = state?.isDone ?? false;
            const isLoading = loadingIds.has(candidate.id);
            const parsed = getParsed(candidate);
            const isExpanded = expandedIds.has(candidate.id);
            const isAuto = status === "auto";

            return (
              <Fragment key={candidate.id}>
                <tr
                  className={cn(
                    "border-b border-gray-200 transition-colors",
                    isDone && "opacity-50",
                    !isDone && "even:bg-gray-50/50",
                  )}
                >
                  <td className="px-4 py-2 text-gray-900">{candidate.listType}</td>
                  <td className="px-4 py-2">
                    {isDone ? (
                      <span className="text-gray-500">
                        {state?.editedKikiNo ?? candidate.kikiNo}
                      </span>
                    ) : status === "manual" ? (
                      <input
                        type="text"
                        value={state?.editedKikiNo ?? candidate.kikiNo}
                        onChange={(e) => handleEdit(candidate.id, e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                        placeholder="機器番号を編集..."
                      />
                    ) : (
                      <span className="text-gray-900">
                        {state?.editedKikiNo ?? candidate.kikiNo}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-900">{candidate.kikiBame}</td>
                  <td className="px-4 py-2 text-center text-gray-900">{candidate.qtyOrd}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-4 py-2">
                    {!isDone && (
                      <div className="flex items-center gap-2">
                        {isAuto && parsed && (
                          <button
                            onClick={() => toggleExpand(candidate.id)}
                            className="text-xs text-blue-600 underline hover:text-blue-800"
                          >
                            {isExpanded ? "プレビューを隠す" : `プレビュー (${parsed.length}台)`}
                          </button>
                        )}
                        <button
                          onClick={() => handleSplit(candidate)}
                          disabled={!isAuto || isLoading}
                          className={cn(
                            "rounded px-3 py-1 text-xs font-medium transition-colors",
                            isAuto
                              ? "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                              : "cursor-not-allowed bg-gray-200 text-gray-500",
                          )}
                        >
                          {isLoading ? "処理中..." : "分割"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
                {isExpanded && parsed && (
                  <tr className="bg-blue-50">
                    <td colSpan={6} className="px-6 py-2">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-gray-500">分割後:</span>
                        {parsed.map((kikiNo) => (
                          <span
                            key={kikiNo}
                            className="rounded bg-white px-2 py-0.5 font-mono text-xs text-gray-700 shadow-sm ring-1 ring-gray-200"
                          >
                            {kikiNo}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>

      {candidates.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500">分割対象の機器がありません</div>
      )}
    </div>
  );
}
