"use client";

import { useState, useCallback, useRef } from "react";
import type { CostItem } from "./types";

export type DetailTab = "overview" | "specs" | "selection" | "block" | "history";

export function useDetailPanel(items: CostItem[], selectedIds: Set<string>) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const prevSelectedIdRef = useRef<string | null>(null);

  // 選択アイテムが1件の場合のみ詳細表示
  const selectedItem =
    selectedIds.size === 1 ? (items.find((i) => selectedIds.has(i.id)) ?? null) : null;

  // 選択が変わったらパネルを開く（レンダリング中に同期的に判定）
  const currentId = selectedItem?.id ?? null;
  if (currentId !== prevSelectedIdRef.current) {
    prevSelectedIdRef.current = currentId;
    if (currentId && !isOpen) {
      setIsOpen(true);
    }
  }

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    toggle,
    close,
    activeTab,
    setActiveTab,
    selectedItem,
  };
}
