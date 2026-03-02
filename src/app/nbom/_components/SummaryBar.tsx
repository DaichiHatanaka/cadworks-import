"use client";

import type { GroupSummary } from "@/lib/nbom/types";
import { formatCurrency, formatWeight, formatVolume } from "@/lib/nbom/formatters";

interface SummaryBarProps {
  summary: GroupSummary & { label: string };
}

export default function SummaryBar({ summary }: SummaryBarProps) {
  return (
    <div className="flex shrink-0 items-center gap-6 border-t border-gray-200 bg-white px-4 py-2 text-xs">
      <span className="font-medium text-gray-700">{summary.label}</span>

      <div className="h-3 w-px bg-gray-200" />

      <div>
        <span className="text-gray-400">合計金額: </span>
        <span className="font-semibold text-gray-800 tabular-nums">
          {formatCurrency(summary.totalAmount)}
        </span>
      </div>

      <div>
        <span className="text-gray-400">合計数量: </span>
        <span className="font-semibold text-gray-800 tabular-nums">
          {summary.totalQuantity.toLocaleString("ja-JP")}
        </span>
      </div>

      <div>
        <span className="text-gray-400">合計重量: </span>
        <span className="text-gray-600 tabular-nums">{formatWeight(summary.totalWeight)}</span>
      </div>

      <div>
        <span className="text-gray-400">合計体積: </span>
        <span className="text-gray-600 tabular-nums">{formatVolume(summary.totalVolume)}</span>
      </div>
    </div>
  );
}
