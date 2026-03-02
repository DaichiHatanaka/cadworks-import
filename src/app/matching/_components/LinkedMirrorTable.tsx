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
  type FilterFn,
} from "@tanstack/react-table";
import type { LinkedPair } from "@/lib/matching/types";
import { cn } from "@/lib/utils";

interface LinkedMirrorTableProps {
  pairs: LinkedPair[];
  selectedRow: LinkedPair | null;
  onSelectRow: (pair: LinkedPair) => void;
  listTypeFilter: string | null;
  statusFilter: "all" | "unsaved" | "saved";
  searchText: string;
}

// ステータスバッジコンポーネント
function StatusBadge({ status }: { status: "saved" | "unsaved" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "unsaved" ? "bg-[#FFC107] text-gray-900" : "bg-[#4CAF50] text-white",
      )}
    >
      {status === "unsaved" ? "未保存" : "保存済み"}
    </span>
  );
}

// 差異検出ヘルパー
function isDifferent(cadValue: string | null, tbomValue: string | null): boolean {
  if (cadValue === null && tbomValue === null) return false;
  return cadValue !== tbomValue;
}

export function LinkedMirrorTable({
  pairs,
  selectedRow,
  onSelectRow,
  listTypeFilter,
  statusFilter,
  searchText,
}: LinkedMirrorTableProps) {
  // フィルタリング処理
  const filteredPairs = useMemo(() => {
    let result = pairs;

    // リストタイプフィルタ
    if (listTypeFilter) {
      result = result.filter((pair) => pair.cad.listType === listTypeFilter);
    }

    // ステータスフィルタ
    if (statusFilter !== "all") {
      result = result.filter((pair) => pair.status === statusFilter);
    }

    // テキスト検索（機器番号・機器名称）
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter((pair) => {
        const cadKikiNo = pair.cad.kikiNo.toLowerCase();
        const cadKikiBame = pair.cad.kikiBame.toLowerCase();
        const tbomKikiNo = pair.tbom?.kikiNo.toLowerCase() || "";
        const tbomKikiBame = pair.tbom?.kikiBame.toLowerCase() || "";

        return (
          cadKikiNo.includes(searchLower) ||
          cadKikiBame.includes(searchLower) ||
          tbomKikiNo.includes(searchLower) ||
          tbomKikiBame.includes(searchLower)
        );
      });
    }

    return result;
  }, [pairs, listTypeFilter, statusFilter, searchText]);

  // ソート処理（LIST_TYPE → KID 昇順）
  const sortedPairs = useMemo(() => {
    return [...filteredPairs].sort((a, b) => {
      if (a.cad.listType !== b.cad.listType) {
        return a.cad.listType.localeCompare(b.cad.listType);
      }
      return a.cad.kid.localeCompare(b.cad.kid);
    });
  }, [filteredPairs]);

  // カラム定義
  const columns = useMemo<ColumnDef<LinkedPair>[]>(
    () => [
      {
        id: "status",
        header: "ステータス",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      // CAD 側
      {
        id: "cad-listType",
        header: () => <span className="font-semibold text-[#1565C0]">CAD - リストタイプ</span>,
        accessorFn: (row) => row.cad.listType,
      },
      {
        id: "cad-kikiNo",
        header: () => <span className="font-semibold text-[#1565C0]">CAD - 機器番号</span>,
        accessorFn: (row) => row.cad.kikiNo,
        cell: ({ row }) => {
          const cad = row.original.cad;
          const tbom = row.original.tbom;
          const hasDiff = tbom && isDifferent(cad.kikiNo, tbom.kikiNo);
          return (
            <span className={hasDiff ? "bg-[#FFA500]" : ""} data-diff={hasDiff || undefined}>
              {cad.kikiNo}
            </span>
          );
        },
      },
      {
        id: "cad-kikiBame",
        header: () => <span className="font-semibold text-[#1565C0]">CAD - 機器名称</span>,
        accessorFn: (row) => row.cad.kikiBame,
        cell: ({ row }) => {
          const cad = row.original.cad;
          const tbom = row.original.tbom;
          const hasDiff = tbom && isDifferent(cad.kikiBame, tbom.kikiBame);
          return (
            <span className={hasDiff ? "bg-[#FFA500]" : ""} data-diff={hasDiff || undefined}>
              {cad.kikiBame}
            </span>
          );
        },
      },
      {
        id: "cad-qtyOrd",
        header: () => <span className="font-semibold text-[#1565C0]">CAD - 数量</span>,
        accessorFn: (row) => row.cad.qtyOrd,
        cell: ({ row }) => {
          const cad = row.original.cad;
          const tbom = row.original.tbom;
          const hasDiff = tbom && isDifferent(cad.qtyOrd, tbom.qtyOrd);
          return (
            <span className={hasDiff ? "bg-[#FFA500]" : ""} data-diff={hasDiff || undefined}>
              {cad.qtyOrd}
            </span>
          );
        },
      },
      {
        id: "cad-shortSpec",
        header: () => <span className="font-semibold text-[#1565C0]">CAD - 概略仕様</span>,
        accessorFn: (row) => row.cad.shortSpec || "",
        cell: ({ row }) => {
          const cad = row.original.cad;
          const tbom = row.original.tbom;
          const hasDiff = tbom && isDifferent(cad.shortSpec, tbom.shortSpec);
          return (
            <span className={hasDiff ? "bg-[#FFA500]" : ""} data-diff={hasDiff || undefined}>
              {cad.shortSpec || ""}
            </span>
          );
        },
      },
      // T-BOM 側
      {
        id: "tbom-listType",
        header: () => <span className="font-semibold text-[#00695C]">T-BOM - リストタイプ</span>,
        accessorFn: (row) => row.tbom?.listType || "",
        cell: ({ row }) => {
          const tbom = row.original.tbom;
          return (
            <span className={!tbom ? "bg-[#E0E0E0]" : ""} data-tbom-absent={!tbom || undefined}>
              {tbom?.listType || ""}
            </span>
          );
        },
      },
      {
        id: "tbom-kikiNo",
        header: () => <span className="font-semibold text-[#00695C]">T-BOM - 機器番号</span>,
        accessorFn: (row) => row.tbom?.kikiNo || "",
        cell: ({ row }) => {
          const tbom = row.original.tbom;
          return (
            <span className={!tbom ? "bg-[#E0E0E0]" : ""} data-tbom-absent={!tbom || undefined}>
              {tbom?.kikiNo || ""}
            </span>
          );
        },
      },
      {
        id: "tbom-kikiBame",
        header: () => <span className="font-semibold text-[#00695C]">T-BOM - 機器名称</span>,
        accessorFn: (row) => row.tbom?.kikiBame || "",
        cell: ({ row }) => {
          const tbom = row.original.tbom;
          return (
            <span className={!tbom ? "bg-[#E0E0E0]" : ""} data-tbom-absent={!tbom || undefined}>
              {tbom?.kikiBame || ""}
            </span>
          );
        },
      },
      {
        id: "tbom-qtyOrd",
        header: () => <span className="font-semibold text-[#00695C]">T-BOM - 数量</span>,
        accessorFn: (row) => row.tbom?.qtyOrd || "",
        cell: ({ row }) => {
          const tbom = row.original.tbom;
          return (
            <span className={!tbom ? "bg-[#E0E0E0]" : ""} data-tbom-absent={!tbom || undefined}>
              {tbom?.qtyOrd || ""}
            </span>
          );
        },
      },
      {
        id: "tbom-shortSpec",
        header: () => <span className="font-semibold text-[#00695C]">T-BOM - 概略仕様</span>,
        accessorFn: (row) => row.tbom?.shortSpec || "",
        cell: ({ row }) => {
          const tbom = row.original.tbom;
          return (
            <span className={!tbom ? "bg-[#E0E0E0]" : ""} data-tbom-absent={!tbom || undefined}>
              {tbom?.shortSpec || ""}
            </span>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: sortedPairs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="overflow-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#1976D2]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-medium tracking-wider text-white uppercase"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onSelectRow(row.original)}
              className={cn(
                "cursor-pointer hover:bg-gray-50",
                selectedRow?.id === row.original.id && "bg-blue-50",
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 text-sm whitespace-nowrap text-gray-900">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {table.getRowModel().rows.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500">紐付け済みデータがありません</div>
      )}
    </div>
  );
}
