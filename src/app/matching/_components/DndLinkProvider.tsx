"use client";

import { useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { CwxRecord, TbomRecord } from "@/lib/matching/types";
import type { LinkResult } from "@/lib/matching/use-matching-state";

interface DndLinkProviderProps {
  children: ReactNode;
  onLink: (cadRow: CwxRecord, tbomRow: TbomRecord) => LinkResult;
}

/**
 * DnD コンテキストラッパー
 * テーブル間のドラッグ&ドロップ紐付け機能を提供する
 */
export function DndLinkProvider({ children, onLink }: DndLinkProviderProps) {
  const [activeItem, setActiveItem] = useState<CwxRecord | null>(null);

  // ポインターセンサー（マウス・タッチ対応）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 移動でドラッグ開始（誤操作防止）
      },
    }),
  );

  // ドラッグ開始
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    // CAD行データを保持
    setActiveItem(active.data.current as CwxRecord);
  };

  // ドラッグ終了
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveItem(null);
      return;
    }

    // CAD行からT-BOM行へのドロップ
    const cadRow = active.data.current as CwxRecord;
    const tbomRow = over.data.current as TbomRecord;

    if (cadRow && tbomRow) {
      const result = onLink(cadRow, tbomRow);

      // LIST_TYPE不一致の場合は警告
      if (!result.success && result.reason === "list_type_mismatch") {
        alert("リストタイプが一致しません。同一リストタイプの機器のみ紐付けできます。");
      }
    }

    setActiveItem(null);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}

      {/* ドラッグ中の視覚フィードバック */}
      <DragOverlay>
        {activeItem ? (
          <div className="rounded-lg border-2 border-blue-500 bg-white p-3 shadow-lg">
            <div className="text-sm font-semibold">{activeItem.kikiNo}</div>
            <div className="text-xs text-gray-600">{activeItem.kikiBame}</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
