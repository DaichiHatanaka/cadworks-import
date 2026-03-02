"use client";

import { useState, useCallback, useMemo } from "react";
import type { GroupNode, FlatRow } from "./types";

export function useGridState() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{
    itemId: string;
    columnId: string;
  } | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string, multi: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(multi ? prev : []);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectRange = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback((groupIds: string[]) => {
    setExpandedGroups(new Set(groupIds));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedGroups(new Set());
  }, []);

  const startEdit = useCallback((itemId: string, columnId: string) => {
    setEditingCell({ itemId, columnId });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  /** グループノード群をフラット行リストに変換 */
  const flattenGroups = useMemo(
    () =>
      (groups: GroupNode[]): FlatRow[] => {
        const rows: FlatRow[] = [];

        const walk = (nodes: GroupNode[], depth: number) => {
          for (const node of nodes) {
            const expanded = expandedGroups.has(node.id);
            rows.push({ type: "group", node, expanded });
            if (expanded) {
              walk(node.children, depth + 1);
              for (const item of node.items) {
                rows.push({ type: "item", item, depth: depth + 1 });
              }
            }
          }
        };

        walk(groups, 0);
        return rows;
      },
    [expandedGroups],
  );

  return {
    selectedIds,
    toggleSelection,
    selectRange,
    clearSelection,
    selectAll,
    editingCell,
    startEdit,
    cancelEdit,
    expandedGroups,
    toggleGroup,
    expandAll,
    collapseAll,
    flattenGroups,
  };
}
