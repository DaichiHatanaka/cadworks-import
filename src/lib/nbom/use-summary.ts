"use client";

import { useMemo } from "react";
import type { CostItem, GroupSummary } from "./types";

export function useSummary(
  items: CostItem[],
  selectedIds: Set<string>,
): GroupSummary & { label: string } {
  return useMemo(() => {
    const selected = selectedIds.size > 0 ? items.filter((i) => selectedIds.has(i.id)) : items;

    let totalAmount = 0;
    let totalQuantity = 0;
    let totalWeight = 0;
    let totalVolume = 0;

    for (const item of selected) {
      totalAmount += item.amount;
      totalQuantity += item.quantity;
      totalWeight += (item.weight ?? 0) * item.quantity;
      totalVolume += (item.volume ?? 0) * item.quantity;
    }

    const label =
      selectedIds.size > 0 ? `選択中: ${selectedIds.size}件` : `全件: ${items.length}件`;

    return {
      label,
      totalAmount,
      totalQuantity,
      totalWeight,
      totalVolume,
      itemCount: selected.length,
    };
  }, [items, selectedIds]);
}
