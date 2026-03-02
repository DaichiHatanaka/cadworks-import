"use client";

import { type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { TbomRecord } from "@/lib/matching/types";
import { cn } from "@/lib/utils";

interface DroppableRowProps {
  id: string;
  data: TbomRecord;
  children: ReactNode;
}

/**
 * ドロップ可能な行ラッパー
 * T-BOM未紐付けテーブルの行をドロップ可能にする
 */
export function DroppableRow({ id, data, children }: DroppableRowProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data,
  });

  return (
    <tr
      ref={setNodeRef}
      className={cn("transition-colors", isOver && "bg-blue-100 ring-2 ring-blue-500")}
    >
      {children}
    </tr>
  );
}
