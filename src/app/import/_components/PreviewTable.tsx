/**
 * CSV data preview table component
 */
"use client";

import { useMemo } from "react";
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";
import type { CsvRecord } from "@/lib/csv/types";

interface PreviewTableProps {
  data: CsvRecord[];
  dataType: "cad" | "tbom";
}

export function PreviewTable({ data, dataType }: PreviewTableProps) {
  const columns = useMemo<ColumnDef<CsvRecord>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 120,
      },
      {
        accessorKey: "jobNo",
        header: "工番",
        size: 100,
      },
      {
        accessorKey: "listType",
        header: "リストタイプ",
        size: 120,
      },
      {
        accessorKey: "kid",
        header: "KID",
        size: 80,
      },
      {
        accessorKey: "idCount",
        header: "ID_COUNT",
        size: 100,
      },
      {
        accessorKey: "kikiNo",
        header: "機器番号",
        size: 100,
      },
      {
        accessorKey: "kikiBame",
        header: "機器名称",
        size: 150,
      },
      {
        accessorKey: "qtyOrd",
        header: "数量",
        size: 80,
      },
      {
        accessorKey: "shortSpec",
        header: "仕様",
        size: 150,
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value || "-";
        },
      },
      ...(dataType === "cad"
        ? [
            {
              accessorKey: "cwxLinkedFlg",
              header: "CAD連携フラグ",
              size: 120,
              cell: ({ getValue }: { getValue: () => string | null }) => {
                const value = getValue();
                return value || "-";
              },
            } as ColumnDef<CsvRecord>,
          ]
        : []),
    ],
    [dataType],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
        プレビューするデータがありません
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase"
                  style={{ width: header.getSize() }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-sm whitespace-nowrap text-gray-900">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
        全{data.length}件のレコード
      </div>
    </div>
  );
}
