/** 積算ステータス */
export type EstimationStatus = "unestimated" | "in_progress" | "estimated" | "confirmed";

/** ソース種別 */
export type SourceType = "link_result" | "manual";

/** 選定ステータス */
export type SelectionStatus = "pending" | "selected" | "manual_override" | "unestimated";

/** タグカテゴリ */
export type TagCategory =
  | "area"
  | "skid_group"
  | "pressure_rating"
  | "procurement"
  | "equipment_type"
  | "custom";

/** タグ */
export interface Tag {
  id: string;
  costItemId: string;
  category: TagCategory;
  value: string;
}

/** タグ定義（マスター） */
export interface TagDefinition {
  id: string;
  jobNo: string;
  category: TagCategory;
  value: string;
  color: string | null;
  sortOrder: number;
}

/** フォルダ */
export interface Folder {
  id: string;
  jobNo: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
}

/** 原価項目 */
export interface CostItem {
  id: string;
  jobNo: string;
  name: string;
  classification: string | null;
  subNumber: string | null;
  skidGroupNo: string | null;
  skidNo: string | null;
  equipmentNo: string | null;
  shortSpec: string | null;
  maker: string | null;
  makerModel: string | null;
  quantity: number;
  unitPrice: number;
  amount: number;
  weight: number | null;
  volume: number | null;
  elFlag: boolean;
  flowSheetNo: string | null;
  remarks: string | null;
  listType: string | null;
  folderId: string | null;
  sortOrder: number;
  estimationStatus: EstimationStatus;
  sourceType: SourceType;
  linkResultId: string | null;
  procurement: string | null;
  selectedProductId: string | null;
  selectionStatus: SelectionStatus | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

/** ビュー種別 */
export type ViewType = "folder" | "equipment" | "area" | "trade" | "status";

/** ビュー設定 */
export interface ViewConfig {
  type: ViewType;
  label: string;
  icon: string;
}

/** グループノード（ツリー表示用） */
export interface GroupNode {
  id: string;
  label: string;
  depth: number;
  children: GroupNode[];
  items: CostItem[];
  /** グループ内の集計 */
  summary: GroupSummary;
}

/** グループ集計 */
export interface GroupSummary {
  totalAmount: number;
  totalQuantity: number;
  totalWeight: number;
  totalVolume: number;
  itemCount: number;
}

/** フラットな表示行（仮想スクロール用） */
export type FlatRow =
  | { type: "group"; node: GroupNode; expanded: boolean }
  | { type: "item"; item: CostItem; depth: number };

/** フィルター条件 */
export interface FilterCondition {
  field: string;
  values: string[];
}

/** タグカテゴリ表示用定義 */
export const TAG_CATEGORY_CONFIG: Record<TagCategory, { label: string; color: string }> = {
  area: { label: "工区", color: "blue" },
  skid_group: { label: "スキッドGr", color: "green" },
  pressure_rating: { label: "圧力等級", color: "orange" },
  procurement: { label: "調達先", color: "purple" },
  equipment_type: { label: "機器種別", color: "red" },
  custom: { label: "カスタム", color: "gray" },
};

/** ビュー定義一覧 */
export const VIEW_DEFINITIONS: ViewConfig[] = [
  { type: "folder", label: "フォルダ", icon: "folder" },
  { type: "equipment", label: "機器別", icon: "factory" },
  { type: "area", label: "エリア別", icon: "mapPin" },
  { type: "trade", label: "工種別", icon: "wrench" },
  { type: "status", label: "進捗別", icon: "chart" },
];
