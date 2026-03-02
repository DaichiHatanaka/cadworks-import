"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import type { TbomRecord } from "@/lib/matching/types";
import { cn } from "@/lib/utils";

interface TbomUnlinkedTableProps {
  data: TbomRecord[];
  selectedRow: TbomRecord | null;
  onSelectRow: (row: TbomRecord) => void;
  listTypeFilter: string | null;
  availableListTypes: string[];
  onListTypeFilterChange: (listType: string | null) => void;
  isLinkedFilterEnabled: boolean;
}

/**
 * T-BOM 未紐付けテーブル（上段右）
 * 5属性を表示し、行選択・連動フィルタ機能を提供する
 */
export function TbomUnlinkedTable({
  data,
  selectedRow,
  onSelectRow,
  listTypeFilter,
  availableListTypes,
  onListTypeFilterChange,
  isLinkedFilterEnabled,
}: TbomUnlinkedTableProps) {
  // カラム定義（CADテーブルと同一の5属性・同一カラム順）
  const columns = useMemo<ColumnDef<TbomRecord>[]>(
    () => [
      {
        accessorKey: "listType",
        header: "リストタイプ",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "kid",
        header: "KID",
        cell: (info) => info.getValue(),
        enableHiding: true,
        meta: { hidden: true },
      },
      {
        accessorKey: "kikiNo",
        header: "機器番号",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "kikiBame",
        header: "機器名称",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "qtyOrd",
        header: "数量",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "shortSpec",
        header: "概略仕様",
        cell: (info) => info.getValue() || "—",
      },
    ],
    [],
  );

  // フィルタ済みデータ（連動フィルタが有効な場合のみ適用）
  const filteredData = useMemo(() => {
    if (!isLinkedFilterEnabled || !listTypeFilter) return data;
    return data.filter((row) => row.listType === listTypeFilter);
  }, [data, listTypeFilter, isLinkedFilterEnabled]);

  // ソート状態（LIST_TYPE → KID 昇順）
  const sorting: SortingState = useMemo(
    () => [
      { id: "listType", desc: false },
      { id: "kid", desc: false },
    ],
    [],
  );

  // テーブルインスタンス
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility: {
        kid: false,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-3">
      {/* ヘッダー: 残件数とフィルタ */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          T-BOM（未紐付け）残 {filteredData.length}件
        </h3>

        {/* リストタイプフィルタ */}
        <select
          value={listTypeFilter || ""}
          onChange={(e) => onListTypeFilterChange(e.target.value || null)}
          className="rounded border border-gray-300 px-3 py-1 text-sm"
        >
          <option value="">全て</option>
          {availableListTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* テーブル */}
      <div className="overflow-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[#1976D2] text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 text-left font-medium">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const isSelected = selectedRow?.id === row.original.id;
              return (
                <tr
                  key={row.id}
                  onClick={() => onSelectRow(row.original)}
                  className={cn(
                    "cursor-pointer border-b border-gray-200 transition-colors",
                    !isSelected && "even:bg-gray-50/50 hover:bg-blue-50",
                    isSelected && "bg-blue-100",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 text-gray-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* データなし表示 */}
        {table.getRowModel().rows.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            未紐付けのT-BOMデータがありません
          </div>
        )}
      </div>
    </div>
  );
}
