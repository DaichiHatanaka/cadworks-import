"use client";

import type { CostItem, EstimationStatus } from "@/lib/nbom/types";
import { formatCurrency, formatWeight, formatVolume } from "@/lib/nbom/formatters";

interface DetailOverviewTabProps {
  item: CostItem;
  onUpdateItem: (id: string, updates: Partial<CostItem>) => void;
  onAssignTag: (costItemIds: string[], category: string, value: string) => void;
  onRemoveTag: (costItemIds: string[], category: string, value: string) => void;
  jobNo: string;
}

const statusLabels: Record<EstimationStatus, { label: string; color: string }> = {
  unestimated: { label: "未積算", color: "text-gray-500 bg-gray-100" },
  in_progress: { label: "積算中", color: "text-yellow-700 bg-yellow-50" },
  estimated: { label: "積算済", color: "text-blue-700 bg-blue-50" },
  confirmed: { label: "確定", color: "text-green-700 bg-green-50" },
};

export default function DetailOverviewTab({ item }: DetailOverviewTabProps) {
  const status = statusLabels[item.estimationStatus];

  return (
    <div className="space-y-4 p-4">
      {/* ステータス */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">ステータス</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* 基本情報 */}
      <div className="space-y-2">
        <FieldRow label="原価項目名" value={item.name} />
        <FieldRow label="機器番号" value={item.equipmentNo} />
        <FieldRow label="概略仕様" value={item.shortSpec} />
        <FieldRow label="分類" value={item.classification} />
        <FieldRow label="分番" value={item.subNumber} />
        <FieldRow label="メーカ" value={item.maker} />
        <FieldRow label="メーカ型番" value={item.makerModel} />
      </div>

      <hr className="border-gray-100" />

      {/* 金額情報 */}
      <div className="space-y-2">
        <FieldRow label="数量" value={item.quantity.toLocaleString("ja-JP")} />
        <FieldRow label="単価" value={formatCurrency(item.unitPrice)} />
        <FieldRow label="金額" value={formatCurrency(item.amount)} bold />
      </div>

      <hr className="border-gray-100" />

      {/* 物理情報 */}
      <div className="space-y-2">
        <FieldRow label="重量(kg/基)" value={formatWeight(item.weight)} />
        <FieldRow label="体積(m³/基)" value={formatVolume(item.volume)} />
        <FieldRow label="EL該当品" value={item.elFlag ? "該当" : "-"} />
        <FieldRow label="フローシートNo" value={item.flowSheetNo} />
        <FieldRow label="調達先" value={item.procurement} />
        <FieldRow label="備考" value={item.remarks} />
      </div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string | null | undefined;
  bold?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-24 shrink-0 text-[11px] text-gray-400">{label}</span>
      <span className={`text-xs ${bold ? "font-semibold text-gray-900" : "text-gray-700"}`}>
        {value || "-"}
      </span>
    </div>
  );
}
