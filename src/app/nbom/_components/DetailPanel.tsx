"use client";

import { cn } from "@/lib/utils";
import type { CostItem } from "@/lib/nbom/types";
import type { DetailTab } from "@/lib/nbom/use-detail-panel";
import DetailOverviewTab from "./DetailOverviewTab";
import DetailSelectionTab from "./DetailSelectionTab";
import TagBadge from "./TagBadge";

interface DetailPanelProps {
  item: CostItem;
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  onClose: () => void;
  onUpdateItem: (id: string, updates: Partial<CostItem>) => void;
  onAssignTag: (costItemIds: string[], category: string, value: string) => void;
  onRemoveTag: (costItemIds: string[], category: string, value: string) => void;
  onOverrideSelection: (costItemId: string, productId: string) => void;
  jobNo: string;
}

const tabs: { key: DetailTab; label: string }[] = [
  { key: "overview", label: "概要" },
  { key: "specs", label: "仕様" },
  { key: "selection", label: "選定" },
  { key: "block", label: "ブロック" },
  { key: "history", label: "履歴" },
];

export default function DetailPanel({
  item,
  activeTab,
  onTabChange,
  onClose,
  onUpdateItem,
  onAssignTag,
  onRemoveTag,
  onOverrideSelection,
  jobNo,
}: DetailPanelProps) {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-gray-200 bg-white">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-gray-900">{item.name}</h3>
          {item.equipmentNo && <p className="text-xs text-gray-500">{item.equipmentNo}</p>}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* タブ */}
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex-1 py-2 text-center text-xs font-medium transition-colors",
              activeTab === tab.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* タブ内容 */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "overview" && (
          <DetailOverviewTab
            item={item}
            onUpdateItem={onUpdateItem}
            onAssignTag={onAssignTag}
            onRemoveTag={onRemoveTag}
            jobNo={jobNo}
          />
        )}

        {activeTab === "specs" && (
          <div className="p-4 text-center text-xs text-gray-400">仕様タブは v2 で実装予定</div>
        )}

        {activeTab === "selection" && (
          <DetailSelectionTab item={item} onOverrideSelection={onOverrideSelection} />
        )}

        {activeTab === "block" && (
          <div className="p-4 text-center text-xs text-gray-400">ブロックタブは v2 で実装予定</div>
        )}

        {activeTab === "history" && (
          <div className="p-4 text-center text-xs text-gray-400">履歴タブは v2 で実装予定</div>
        )}
      </div>

      {/* タグ表示（常時） */}
      {item.tags.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-2">
          <span className="mb-1 block text-[10px] font-medium tracking-wider text-gray-400 uppercase">
            Tags
          </span>
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <TagBadge
                key={tag.id}
                category={tag.category}
                value={tag.value}
                onRemove={() => onRemoveTag([item.id], tag.category, tag.value)}
              />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
