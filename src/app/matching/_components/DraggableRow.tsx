"use client";

import { type ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { CwxRecord } from "@/lib/matching/types";

interface DraggableRowProps {
  id: string;
  data: CwxRecord;
  children: ReactNode;
}

/**
 * ドラッグ可能な行ラッパー
 * CAD未紐付けテーブルの行をドラッグ可能にする
 */
export function DraggableRow({ id, data, children }: DraggableRowProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data,
  });

  return (
    <tr
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }}
    >
      {children}
    </tr>
  );
}
