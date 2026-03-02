"use client";

import { cn } from "@/lib/utils";
import type { CostItem, ViewType, FilterCondition } from "@/lib/nbom/types";
import { VIEW_DEFINITIONS } from "@/lib/nbom/types";

interface ViewControlBarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  filters: FilterCondition[];
  onAddFilter: (field: string, values: string[]) => void;
  onRemoveFilter: (field: string) => void;
  onClearFilters: () => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  columnVisibility: Record<string, boolean>;
  onToggleColumn: (columnId: string) => void;
  items: CostItem[];
  getFilterOptions: (items: CostItem[], field: string) => string[];
}

const viewIcons: Record<ViewType, string> = {
  folder: "📁",
  equipment: "🏭",
  area: "📍",
  trade: "🔧",
  status: "📊",
};

export default function ViewControlBar({
  activeView,
  onViewChange,
  filters,
  onRemoveFilter,
  onClearFilters,
  searchText,
  onSearchChange,
}: ViewControlBarProps) {
  return (
    <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-2">
      {/* ビュー切替タブ */}
      <div className="flex items-center gap-1">
        {VIEW_DEFINITIONS.map((v) => (
          <button
            key={v.type}
            onClick={() => onViewChange(v.type)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeView === v.type
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
            )}
          >
            <span className="mr-1">{viewIcons[v.type]}</span>
            {v.label}
          </button>
        ))}
      </div>

      {/* フィルター + 検索 */}
      <div className="mt-2 flex items-center gap-2">
        {/* アクティブフィルターチップ */}
        {filters.map((f) => (
          <span
            key={f.field}
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
          >
            {f.field}: {f.values.join(", ")}
            <button
              onClick={() => onRemoveFilter(f.field)}
              className="ml-0.5 text-blue-400 hover:text-blue-600"
            >
              ×
            </button>
          </span>
        ))}
        {filters.length > 0 && (
          <button onClick={onClearFilters} className="text-xs text-gray-400 hover:text-gray-600">
            クリア
          </button>
        )}

        {/* スペーサー */}
        <div className="flex-1" />

        {/* 検索 */}
        <div className="relative">
          <svg
            className="absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="機器検索..."
            className="w-56 rounded-md border border-gray-200 py-1 pr-2 pl-7 text-xs placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
