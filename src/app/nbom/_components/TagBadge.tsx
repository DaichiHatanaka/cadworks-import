"use client";

import type { TagCategory } from "@/lib/nbom/types";
import { TAG_CATEGORY_CONFIG } from "@/lib/nbom/types";

const colorClasses: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-green-50 text-green-700 ring-green-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  gray: "bg-gray-50 text-gray-600 ring-gray-200",
};

interface TagBadgeProps {
  category: TagCategory;
  value: string;
  onRemove?: () => void;
}

export default function TagBadge({ category, value, onRemove }: TagBadgeProps) {
  const config = TAG_CATEGORY_CONFIG[category];
  const cls = colorClasses[config.color] ?? colorClasses.gray;

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0 text-[10px] font-medium ring-1 ring-inset ${cls}`}
    >
      {value}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-75"
        >
          ×
        </button>
      )}
    </span>
  );
}
