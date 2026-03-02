"use client";

import type { Tag } from "@/lib/nbom/types";
import TagBadge from "./TagBadge";

interface TagCellProps {
  tags: Tag[];
}

export default function TagCell({ tags }: TagCellProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-0.5">
      {tags.slice(0, 3).map((tag) => (
        <TagBadge key={tag.id} category={tag.category} value={tag.value} />
      ))}
      {tags.length > 3 && <span className="text-[10px] text-gray-400">+{tags.length - 3}</span>}
    </div>
  );
}
