"use client";

import type { CostItem } from "@/lib/nbom/types";

interface ContextActionBarProps {
  selectedIds: Set<string>;
  items: CostItem[];
  onDelete: (id: string) => void;
  onBulkUpdate: (ids: string[], updates: Record<string, unknown>) => void;
  onAddItem: () => void;
  onRunSelection: (costItemIds?: string[]) => void;
  selectionRunning: boolean;
}

export default function ContextActionBar({
  selectedIds,
  onDelete,
  onAddItem,
  onRunSelection,
  selectionRunning,
}: ContextActionBarProps) {
  const selectedCount = selectedIds.size;
  const selectedArray = Array.from(selectedIds);

  if (selectedCount === 0) {
    // 工番レベルアクション
    return (
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-4 py-1.5">
        <button
          onClick={onAddItem}
          className="rounded px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
        >
          + 原価項目追加
        </button>
        <div className="h-3 w-px bg-gray-200" />
        <button
          onClick={() => onRunSelection()}
          disabled={selectionRunning}
          className="rounded px-2.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
        >
          {selectionRunning ? "選定中..." : "全件機器選定"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-blue-100 bg-blue-50/50 px-4 py-1.5">
      <span className="text-xs font-medium text-blue-700">{selectedCount}件選択中</span>
      <div className="h-3 w-px bg-blue-200" />

      <button
        onClick={() => onRunSelection(selectedArray)}
        disabled={selectionRunning}
        className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
      >
        {selectionRunning ? "選定中..." : "機器選定"}
      </button>
      <button className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-white">
        タグ編集
      </button>
      <button className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-white">
        一括編集
      </button>
      <button className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-white">
        コピー
      </button>

      {selectedCount === 1 && (
        <button
          onClick={() => onDelete(selectedArray[0])}
          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          削除
        </button>
      )}
    </div>
  );
}
