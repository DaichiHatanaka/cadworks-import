import type { ConditionEvaluator } from "../types";

/** 条件191: ベンダーリスト（vendorListChecked === true） */
export const vendorListFilter: ConditionEvaluator = (_cadAttrs, candidates) => {
  return candidates.filter((p) => p.vendorListChecked);
};

/** 条件192: 型番完全一致 */
export const modelNumberExactMatch: ConditionEvaluator = (cadAttrs, candidates) => {
  if (!cadAttrs.modelNumber) return candidates;
  return candidates.filter((p) => p.makerModel === cadAttrs.modelNumber);
};

/** 条件193: 型番部分一致 */
export const modelNumberPartialMatch: ConditionEvaluator = (cadAttrs, candidates) => {
  if (!cadAttrs.modelNumber) return candidates;
  return candidates.filter(
    (p) =>
      p.makerModel?.includes(cadAttrs.modelNumber!) ||
      cadAttrs.modelNumber!.includes(p.makerModel ?? ""),
  );
};

/** 条件194: 購買推奨品 */
export const recommendedFilter: ConditionEvaluator = (_cadAttrs, candidates) => {
  return candidates.filter((p) => p.recommended);
};

/** 条件195: 最安値 */
export const lowestPriceFilter: ConditionEvaluator = (_cadAttrs, candidates) => {
  if (candidates.length === 0) return [];
  const minPrice = Math.min(...candidates.map((p) => p.unitPrice));
  return candidates.filter((p) => p.unitPrice === minPrice);
};
