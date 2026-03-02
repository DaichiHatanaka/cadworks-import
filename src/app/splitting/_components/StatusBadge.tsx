import { cn } from "@/lib/utils";
import type { SplitStatus } from "@/lib/splitting/types";

interface StatusBadgeProps {
  status: SplitStatus;
}

const statusConfig: Record<SplitStatus, { label: string; className: string }> = {
  auto: {
    label: "自動分割可",
    className: "bg-green-100 text-green-800",
  },
  manual: {
    label: "手動対応必要",
    className: "bg-yellow-100 text-yellow-800",
  },
  done: {
    label: "分割済",
    className: "bg-gray-100 text-gray-600",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
