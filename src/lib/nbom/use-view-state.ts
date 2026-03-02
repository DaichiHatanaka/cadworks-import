"use client";

import { useState, useCallback, useMemo } from "react";
import type { CostItem, ViewType, FilterCondition, TagCategory } from "./types";

export function useViewState() {
  const [activeView, setActiveView] = useState<ViewType>("folder");
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [searchText, setSearchText] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    makerModel: false,
    flowSheetNo: false,
    remarks: false,
  });

  const addFilter = useCallback((field: string, values: string[]) => {
    setFilters((prev) => {
      const existing = prev.find((f) => f.field === field);
      if (existing) {
        return prev.map((f) => (f.field === field ? { ...f, values } : f));
      }
      return [...prev, { field, values }];
    });
  }, []);

  const removeFilter = useCallback((field: string) => {
    setFilters((prev) => prev.filter((f) => f.field !== field));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
    setSearchText("");
  }, []);

  const toggleColumn = useCallback((columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: prev[columnId] === false ? true : false,
    }));
  }, []);

  /** フィルター + 検索でアイテムを絞り込む */
  const filterItems = useCallback(
    (items: CostItem[]): CostItem[] => {
      let result = items;

      // フィルター適用
      for (const filter of filters) {
        if (filter.values.length === 0) continue;
        result = result.filter((item) => {
          if (filter.field === "listType") {
            return filter.values.includes(item.listType ?? "");
          }
          if (filter.field === "maker") {
            return filter.values.includes(item.maker ?? "");
          }
          if (filter.field === "procurement") {
            return filter.values.includes(item.procurement ?? "");
          }
          // タグカテゴリのフィルター
          const tagCategories: TagCategory[] = [
            "area",
            "skid_group",
            "pressure_rating",
            "procurement",
            "equipment_type",
            "custom",
          ];
          if (tagCategories.includes(filter.field as TagCategory)) {
            return item.tags.some(
              (t) => t.category === filter.field && filter.values.includes(t.value),
            );
          }
          return true;
        });
      }

      // テキスト検索
      if (searchText.trim()) {
        const lower = searchText.toLowerCase();
        result = result.filter(
          (item) =>
            item.name.toLowerCase().includes(lower) ||
            (item.equipmentNo?.toLowerCase().includes(lower) ?? false) ||
            (item.shortSpec?.toLowerCase().includes(lower) ?? false) ||
            (item.maker?.toLowerCase().includes(lower) ?? false) ||
            (item.classification?.toLowerCase().includes(lower) ?? false),
        );
      }

      return result;
    },
    [filters, searchText],
  );

  /** フィルターで使える一意の値を取得 */
  const getFilterOptions = useMemo(
    () =>
      (items: CostItem[], field: string): string[] => {
        const values = new Set<string>();
        for (const item of items) {
          if (field === "listType" && item.listType) values.add(item.listType);
          if (field === "maker" && item.maker) values.add(item.maker);
          if (field === "procurement" && item.procurement) values.add(item.procurement);
        }
        return Array.from(values).sort();
      },
    [],
  );

  return {
    activeView,
    setActiveView,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    searchText,
    setSearchText,
    columnVisibility,
    setColumnVisibility,
    toggleColumn,
    filterItems,
    getFilterOptions,
  };
}
