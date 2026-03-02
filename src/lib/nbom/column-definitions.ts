import { createColumnHelper } from "@tanstack/react-table";
import type { CostItem } from "./types";

const col = createColumnHelper<CostItem>();

/** デフォルトの列定義 */
export const defaultColumns = [
  col.accessor("name", {
    header: "原価項目",
    size: 200,
    minSize: 120,
  }),
  col.accessor("classification", {
    header: "分類",
    size: 60,
  }),
  col.accessor("subNumber", {
    header: "分番",
    size: 60,
  }),
  col.accessor("skidGroupNo", {
    header: "スキッドGrNo",
    size: 100,
    enableHiding: true,
  }),
  col.accessor("skidNo", {
    header: "スキッドNo",
    size: 90,
    enableHiding: true,
  }),
  col.accessor("equipmentNo", {
    header: "機器番号",
    size: 100,
  }),
  col.accessor("shortSpec", {
    header: "概略仕様",
    size: 150,
  }),
  col.accessor("maker", {
    header: "メーカ",
    size: 100,
  }),
  col.accessor("makerModel", {
    header: "メーカ型番",
    size: 100,
    enableHiding: true,
    meta: { defaultHidden: true },
  }),
  col.accessor("quantity", {
    header: "数量",
    size: 60,
    meta: { align: "right" },
  }),
  col.accessor("unitPrice", {
    header: "単価(円)",
    size: 100,
    meta: { align: "right", format: "currency" },
  }),
  col.accessor("amount", {
    header: "金額(円)",
    size: 100,
    meta: { align: "right", format: "currency" },
  }),
  col.display({
    id: "tags",
    header: "Tags",
    size: 180,
  }),
  col.accessor("procurement", {
    header: "調達先",
    size: 80,
  }),
  col.accessor("elFlag", {
    header: "EL該当品",
    size: 80,
  }),
  col.accessor("weight", {
    header: "重量(kg/基)",
    size: 100,
    meta: { align: "right" },
  }),
  col.accessor("volume", {
    header: "体積(m³/基)",
    size: 100,
    meta: { align: "right" },
  }),
  col.accessor("flowSheetNo", {
    header: "フローシートNo",
    size: 120,
    enableHiding: true,
    meta: { defaultHidden: true },
  }),
  col.accessor("remarks", {
    header: "備考",
    size: 150,
    enableHiding: true,
    meta: { defaultHidden: true },
  }),
];

/** デフォルトの列可視性 */
export function getDefaultColumnVisibility(): Record<string, boolean> {
  const vis: Record<string, boolean> = {};
  for (const c of defaultColumns) {
    const meta = (c as { columnDef?: { meta?: { defaultHidden?: boolean } } }).columnDef?.meta;
    if (meta?.defaultHidden) {
      const id =
        "accessorKey" in c ? (c as { accessorKey: string }).accessorKey : (c as { id?: string }).id;
      if (id) vis[id] = false;
    }
  }
  return vis;
}
