"use client";

import { cn } from "@/lib/utils";
import type { SelectionStatus } from "@/lib/nbom/types";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  selected: {
    label: "選定済",
    bg: "bg-green-50",
    text: "text-green-700",
  },
  manual_override: {
    label: "手動選定",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  multiple_candidates: {
    label: "複数候補",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
  },
  unestimated: {
    label: "未積算",
    bg: "bg-red-50",
    text: "text-red-700",
  },
  pending: {
    label: "未実行",
    bg: "bg-gray-50",
    text: "text-gray-500",
  },
};

interface SelectionStatusBadgeProps {
  status: SelectionStatus | null;
}

export default function SelectionStatusBadge({ status }: SelectionStatusBadgeProps) {
  const config = STATUS_CONFIG[status ?? "pending"] ?? STATUS_CONFIG.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
        config.bg,
        config.text,
      )}
    >
      {config.label}
    </span>
  );
}
