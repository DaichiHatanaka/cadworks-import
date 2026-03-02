/** CAD shortSpec からパースされた構造化属性 */
export interface ParsedAttributes {
  form: string | null;
  bodyMaterial: string | null;
  impellerMaterial: string | null;
  material: string | null;
  capacity: number | null;
  nominalCapacity: number | null;
  flowRate: number | null;
  head: number | null;
  modelNumber: string | null;
}

/** 製品属性マップ（attrKey → attrValue / numericValue） */
export interface ProductAttribute {
  id: string;
  attrKey: string;
  attrValue: string;
  numericValue: number | null;
}

/** 製品 + 属性マップ */
export interface ProductWithAttributes {
  id: string;
  listType: string;
  productName: string;
  maker: string | null;
  makerModel: string | null;
  unitPrice: number;
  vendorListChecked: boolean;
  recommended: boolean;
  weight: number | null;
  volume: number | null;
  attrs: Record<string, string>;
  numericAttrs: Record<string, number>;
}

/** 条件定義 */
export interface ConditionDef {
  conditionNo: string;
  sortOrder: number;
  isCommon: boolean;
  config: Record<string, unknown> | null;
}

/** 条件評価関数のシグネチャ */
export type ConditionEvaluator = (
  cadAttrs: ParsedAttributes,
  candidates: ProductWithAttributes[],
) => ProductWithAttributes[];

/** 条件ログエントリ */
export interface ConditionLogEntry {
  conditionNo: string;
  conditionName: string;
  inputCount: number;
  outputCount: number;
  isCommon: boolean;
}

/** 選定エンジン入力 */
export interface SelectionInput {
  cadAttributes: ParsedAttributes;
  candidates: ProductWithAttributes[];
  conditionSequence: ConditionDef[];
}

/** 選定エンジン出力 */
export interface SelectionOutput {
  status: "selected" | "unestimated" | "multiple_candidates";
  selectedProduct: ProductWithAttributes | null;
  candidateCount: number;
  conditionLog: ConditionLogEntry[];
}

/** 選定実行サマリー */
export interface SelectionSummary {
  total: number;
  selected: number;
  unestimated: number;
  multipleCandidates: number;
}

/** 選定ステータス */
export type SelectionStatus = "pending" | "selected" | "manual_override" | "unestimated";
