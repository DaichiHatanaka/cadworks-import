"use client";

import { useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import type { CostItem, FlatRow } from "@/lib/nbom/types";
import { formatCurrency, formatCurrencyShort } from "@/lib/nbom/formatters";
import DataGridGroupRow from "./DataGridGroupRow";
import InlineEditCell from "./InlineEditCell";
import TagCell from "./TagCell";
import SelectionStatusBadge from "./SelectionStatusBadge";

interface DataGridProps {
  rows: FlatRow[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string, multi: boolean) => void;
  onSelectRange: (ids: string[]) => void;
  onToggleGroup: (groupId: string) => void;
  editingCell: { itemId: string; columnId: string } | null;
  onStartEdit: (itemId: string, columnId: string) => void;
  onCancelEdit: () => void;
  onUpdateItem: (id: string, updates: Partial<CostItem>) => void;
  columnVisibility: Record<string, boolean>;
}

const ROW_HEIGHT = 32;

export default function DataGrid({
  rows,
  selectedIds,
  onToggleSelection,
  onToggleGroup,
  editingCell,
  onStartEdit,
  onCancelEdit,
  onUpdateItem,
  columnVisibility,
}: DataGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  const isVisible = useCallback(
    (col: string) => columnVisibility[col] !== false,
    [columnVisibility],
  );

  const handleCellDoubleClick = useCallback(
    (itemId: string, columnId: string) => {
      onStartEdit(itemId, columnId);
    },
    [onStartEdit],
  );

  const handleCellCommit = useCallback(
    (itemId: string, columnId: string, value: string | number | boolean) => {
      onUpdateItem(itemId, { [columnId]: value });
      onCancelEdit();
    },
    [onUpdateItem, onCancelEdit],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* ヘッダー */}
      <div className="flex shrink-0 border-b border-gray-300 bg-gray-100 text-[11px] font-semibold text-gray-600">
        <div className="w-8 shrink-0" />
        <div className="w-48 shrink-0 px-2 py-1.5">原価項目</div>
        {isVisible("classification") && <div className="w-14 shrink-0 px-2 py-1.5">分類</div>}
        {isVisible("subNumber") && <div className="w-14 shrink-0 px-2 py-1.5">分番</div>}
        {isVisible("equipmentNo") && <div className="w-24 shrink-0 px-2 py-1.5">機器番号</div>}
        {isVisible("shortSpec") && <div className="w-36 shrink-0 px-2 py-1.5">概略仕様</div>}
        {isVisible("maker") && <div className="w-24 shrink-0 px-2 py-1.5">メーカ</div>}
        {isVisible("quantity") && <div className="w-14 shrink-0 px-2 py-1.5 text-right">数量</div>}
        {isVisible("unitPrice") && (
          <div className="w-24 shrink-0 px-2 py-1.5 text-right">単価(円)</div>
        )}
        {isVisible("amount") && (
          <div className="w-24 shrink-0 px-2 py-1.5 text-right">金額(円)</div>
        )}
        {isVisible("selectionStatus") && <div className="w-20 shrink-0 px-2 py-1.5">選定</div>}
        {isVisible("tags") && <div className="w-44 shrink-0 px-2 py-1.5">Tags</div>}
        {isVisible("procurement") && <div className="w-20 shrink-0 px-2 py-1.5">調達先</div>}
      </div>

      {/* 仮想スクロール本体 */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        <div style={{ height: `${virtualizer.getTotalSize()}px` }} className="relative w-full">
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];

            if (row.type === "group") {
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <DataGridGroupRow
                    node={row.node}
                    expanded={row.expanded}
                    onToggle={() => onToggleGroup(row.node.id)}
                  />
                </div>
              );
            }

            const item = row.item;
            const isSelected = selectedIds.has(item.id);
            const depth = row.depth;

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={cn(
                  "flex items-center border-b border-gray-100 text-xs text-gray-900",
                  isSelected ? "bg-blue-50" : "bg-white hover:bg-gray-50/50",
                )}
                onClick={(e) => onToggleSelection(item.id, e.ctrlKey || e.metaKey)}
              >
                {/* インデント + チェック */}
                <div
                  className="flex w-8 shrink-0 items-center justify-center"
                  style={{ paddingLeft: depth * 16 }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="h-3 w-3 rounded border-gray-300"
                  />
                </div>

                {/* 原価項目名 */}
                <div
                  className="w-48 shrink-0 truncate px-2 py-1"
                  style={{ paddingLeft: depth * 12 + 8 }}
                >
                  <EditableCell
                    itemId={item.id}
                    columnId="name"
                    value={item.name}
                    editing={editingCell}
                    onDoubleClick={handleCellDoubleClick}
                    onCommit={handleCellCommit}
                    onCancel={onCancelEdit}
                  />
                </div>

                {isVisible("classification") && (
                  <div className="w-14 shrink-0 truncate px-2 py-1 text-gray-900">
                    {item.classification ?? ""}
                  </div>
                )}

                {isVisible("subNumber") && (
                  <div className="w-14 shrink-0 truncate px-2 py-1 text-gray-900">
                    {item.subNumber ?? ""}
                  </div>
                )}

                {isVisible("equipmentNo") && (
                  <div className="w-24 shrink-0 truncate px-2 py-1">
                    <EditableCell
                      itemId={item.id}
                      columnId="equipmentNo"
                      value={item.equipmentNo ?? ""}
                      editing={editingCell}
                      onDoubleClick={handleCellDoubleClick}
                      onCommit={handleCellCommit}
                      onCancel={onCancelEdit}
                    />
                  </div>
                )}

                {isVisible("shortSpec") && (
                  <div className="w-36 shrink-0 truncate px-2 py-1 text-gray-900">
                    {item.shortSpec ?? ""}
                  </div>
                )}

                {isVisible("maker") && (
                  <div className="w-24 shrink-0 truncate px-2 py-1">
                    <EditableCell
                      itemId={item.id}
                      columnId="maker"
                      value={item.maker ?? ""}
                      editing={editingCell}
                      onDoubleClick={handleCellDoubleClick}
                      onCommit={handleCellCommit}
                      onCancel={onCancelEdit}
                    />
                  </div>
                )}

                {isVisible("quantity") && (
                  <div className="w-14 shrink-0 px-2 py-1 text-right tabular-nums">
                    <EditableCell
                      itemId={item.id}
                      columnId="quantity"
                      value={String(item.quantity)}
                      editing={editingCell}
                      onDoubleClick={handleCellDoubleClick}
                      onCommit={(id, col, val) =>
                        handleCellCommit(id, col, parseInt(String(val), 10) || 0)
                      }
                      onCancel={onCancelEdit}
                      align="right"
                    />
                  </div>
                )}

                {isVisible("unitPrice") && (
                  <div className="w-24 shrink-0 px-2 py-1 text-right tabular-nums">
                    <EditableCell
                      itemId={item.id}
                      columnId="unitPrice"
                      value={String(item.unitPrice)}
                      displayValue={formatCurrency(item.unitPrice)}
                      editing={editingCell}
                      onDoubleClick={handleCellDoubleClick}
                      onCommit={(id, col, val) =>
                        handleCellCommit(id, col, parseInt(String(val), 10) || 0)
                      }
                      onCancel={onCancelEdit}
                      align="right"
                    />
                  </div>
                )}

                {isVisible("amount") && (
                  <div className="w-24 shrink-0 px-2 py-1 text-right font-medium tabular-nums">
                    {formatCurrencyShort(item.amount)}
                  </div>
                )}

                {isVisible("selectionStatus") && (
                  <div className="w-20 shrink-0 px-2 py-1">
                    <SelectionStatusBadge status={item.selectionStatus} />
                  </div>
                )}

                {isVisible("tags") && (
                  <div className="w-44 shrink-0 px-2 py-1">
                    <TagCell tags={item.tags} />
                  </div>
                )}

                {isVisible("procurement") && (
                  <div className="w-20 shrink-0 truncate px-2 py-1 text-gray-900">
                    {item.procurement ?? ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** 汎用的な編集可能セル（InlineEditCellのラッパー） */
function EditableCell({
  itemId,
  columnId,
  value,
  displayValue,
  editing,
  onDoubleClick,
  onCommit,
  onCancel,
  align,
}: {
  itemId: string;
  columnId: string;
  value: string;
  displayValue?: string;
  editing: { itemId: string; columnId: string } | null;
  onDoubleClick: (itemId: string, columnId: string) => void;
  onCommit: (itemId: string, columnId: string, value: string | number | boolean) => void;
  onCancel: () => void;
  align?: "left" | "right";
}) {
  const isEditing = editing?.itemId === itemId && editing?.columnId === columnId;

  if (isEditing) {
    return (
      <InlineEditCell
        initialValue={value}
        onCommit={(val) => onCommit(itemId, columnId, val)}
        onCancel={onCancel}
        align={align}
      />
    );
  }

  return (
    <span
      className="block cursor-default truncate"
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick(itemId, columnId);
      }}
      style={{ textAlign: align }}
    >
      {displayValue ?? value}
    </span>
  );
}
