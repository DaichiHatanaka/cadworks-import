"use client";

import type { GroupNode } from "@/lib/nbom/types";
import { formatCurrencyShort } from "@/lib/nbom/formatters";

interface DataGridGroupRowProps {
  node: GroupNode;
  expanded: boolean;
  onToggle: () => void;
}

export default function DataGridGroupRow({ node, expanded, onToggle }: DataGridGroupRowProps) {
  return (
    <div
      className="flex h-8 cursor-pointer items-center border-b border-gray-200 bg-gray-50 text-xs font-medium hover:bg-gray-100"
      onClick={onToggle}
      style={{ paddingLeft: node.depth * 16 }}
    >
      {/* 展開/折りたたみアイコン */}
      <div className="flex w-8 shrink-0 items-center justify-center">
        <svg
          className={`h-3.5 w-3.5 text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* フォルダアイコン + ラベル */}
      <span className="mr-1.5 text-sm">📁</span>
      <span className="mr-3 text-gray-800">{node.label}</span>

      {/* 集計 */}
      <span className="text-[10px] text-gray-400">({node.summary.itemCount}件)</span>

      <div className="flex-1" />

      {/* 金額集計 */}
      {node.summary.totalAmount > 0 && (
        <span className="mr-4 text-gray-500 tabular-nums">
          {formatCurrencyShort(node.summary.totalAmount)}
        </span>
      )}
    </div>
  );
}
