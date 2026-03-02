import type { CostItem, Folder, GroupNode, GroupSummary, TagCategory } from "./types";

/** アイテム群の集計を算出 */
function summarize(items: CostItem[]): GroupSummary {
  let totalAmount = 0;
  let totalQuantity = 0;
  let totalWeight = 0;
  let totalVolume = 0;
  for (const item of items) {
    totalAmount += item.amount;
    totalQuantity += item.quantity;
    totalWeight += (item.weight ?? 0) * item.quantity;
    totalVolume += (item.volume ?? 0) * item.quantity;
  }
  return { totalAmount, totalQuantity, totalWeight, totalVolume, itemCount: items.length };
}

/** 子ノードの集計を再帰的にマージ */
function summarizeNode(node: GroupNode): GroupSummary {
  const itemSummary = summarize(node.items);
  for (const child of node.children) {
    const childSummary = summarizeNode(child);
    itemSummary.totalAmount += childSummary.totalAmount;
    itemSummary.totalQuantity += childSummary.totalQuantity;
    itemSummary.totalWeight += childSummary.totalWeight;
    itemSummary.totalVolume += childSummary.totalVolume;
    itemSummary.itemCount += childSummary.itemCount;
  }
  node.summary = itemSummary;
  return itemSummary;
}

/** フォルダ階層ビュー */
export function groupByFolder(items: CostItem[], folders: Folder[]): GroupNode[] {
  const folderMap = new Map<string, Folder>();
  for (const f of folders) folderMap.set(f.id, f);

  // フォルダ ID → GroupNode
  const nodeMap = new Map<string, GroupNode>();
  for (const f of folders) {
    nodeMap.set(f.id, {
      id: `folder-${f.id}`,
      label: f.name,
      depth: 0,
      children: [],
      items: [],
      summary: { totalAmount: 0, totalQuantity: 0, totalWeight: 0, totalVolume: 0, itemCount: 0 },
    });
  }

  // アイテムをフォルダに割り当て
  const unassigned: CostItem[] = [];
  for (const item of items) {
    if (item.folderId && nodeMap.has(item.folderId)) {
      nodeMap.get(item.folderId)!.items.push(item);
    } else {
      unassigned.push(item);
    }
  }

  // 親子関係を構築
  const roots: GroupNode[] = [];
  for (const f of folders) {
    const node = nodeMap.get(f.id)!;
    if (f.parentId && nodeMap.has(f.parentId)) {
      const parent = nodeMap.get(f.parentId)!;
      node.depth = parent.depth + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // 未割当があれば「未分類」ノードを追加
  if (unassigned.length > 0) {
    roots.push({
      id: "folder-unassigned",
      label: "未分類",
      depth: 0,
      children: [],
      items: unassigned,
      summary: { totalAmount: 0, totalQuantity: 0, totalWeight: 0, totalVolume: 0, itemCount: 0 },
    });
  }

  // 集計算出
  for (const root of roots) summarizeNode(root);

  return roots;
}

/** リストタイプ別ビュー（機器別） */
export function groupByListType(
  items: CostItem[],
  listTypeMaster: { listType: string; listName: string }[],
): GroupNode[] {
  const masterMap = new Map<string, string>();
  for (const m of listTypeMaster) masterMap.set(m.listType, m.listName);

  const groups = new Map<string, CostItem[]>();
  for (const item of items) {
    const key = item.listType ?? "unknown";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  const roots: GroupNode[] = [];
  for (const [key, groupItems] of groups) {
    const node: GroupNode = {
      id: `listtype-${key}`,
      label: masterMap.get(key) ?? key,
      depth: 0,
      children: [],
      items: groupItems,
      summary: { totalAmount: 0, totalQuantity: 0, totalWeight: 0, totalVolume: 0, itemCount: 0 },
    };
    summarizeNode(node);
    roots.push(node);
  }

  return roots;
}

/** タグベースのグルーピング */
export function groupByTag(items: CostItem[], category: TagCategory): GroupNode[] {
  const groups = new Map<string, CostItem[]>();
  const noTag: CostItem[] = [];

  for (const item of items) {
    const tag = item.tags.find((t) => t.category === category);
    if (tag) {
      if (!groups.has(tag.value)) groups.set(tag.value, []);
      groups.get(tag.value)!.push(item);
    } else {
      noTag.push(item);
    }
  }

  const roots: GroupNode[] = [];
  for (const [value, groupItems] of groups) {
    const node: GroupNode = {
      id: `tag-${category}-${value}`,
      label: value,
      depth: 0,
      children: [],
      items: groupItems,
      summary: { totalAmount: 0, totalQuantity: 0, totalWeight: 0, totalVolume: 0, itemCount: 0 },
    };
    summarizeNode(node);
    roots.push(node);
  }

  if (noTag.length > 0) {
    const node: GroupNode = {
      id: `tag-${category}-unassigned`,
      label: "未設定",
      depth: 0,
      children: [],
      items: noTag,
      summary: { totalAmount: 0, totalQuantity: 0, totalWeight: 0, totalVolume: 0, itemCount: 0 },
    };
    summarizeNode(node);
    roots.push(node);
  }

  return roots;
}

/** 積算ステータス別ビュー */
export function groupByStatus(items: CostItem[]): GroupNode[] {
  const labels: Record<string, string> = {
    unestimated: "未積算",
    in_progress: "積算中",
    estimated: "積算済",
    confirmed: "確定",
  };

  const groups = new Map<string, CostItem[]>();
  for (const item of items) {
    const key = item.estimationStatus;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  const order = ["unestimated", "in_progress", "estimated", "confirmed"];
  const roots: GroupNode[] = [];
  for (const key of order) {
    const groupItems = groups.get(key);
    if (!groupItems) continue;
    const node: GroupNode = {
      id: `status-${key}`,
      label: labels[key] ?? key,
      depth: 0,
      children: [],
      items: groupItems,
      summary: { totalAmount: 0, totalQuantity: 0, totalWeight: 0, totalVolume: 0, itemCount: 0 },
    };
    summarizeNode(node);
    roots.push(node);
  }

  return roots;
}
