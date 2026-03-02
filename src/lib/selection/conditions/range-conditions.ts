import type { ConditionEvaluator, ProductWithAttributes } from "../types";

/**
 * 近似上位選定: 指定値以上の候補の中で最小値のものを選ぶ
 * 候補が複数同値の場合はすべて返す
 */
function nearestAbove(
  candidates: ProductWithAttributes[],
  attrKey: string,
  targetValue: number | null,
): ProductWithAttributes[] {
  if (targetValue == null) return candidates;

  // 属性を持ち、かつ target 以上の候補
  const qualified = candidates.filter(
    (p) => p.numericAttrs[attrKey] != null && p.numericAttrs[attrKey] >= targetValue,
  );

  if (qualified.length === 0) return [];

  // 最小値を見つける
  const minValue = Math.min(...qualified.map((p) => p.numericAttrs[attrKey]));

  return qualified.filter((p) => p.numericAttrs[attrKey] === minValue);
}

/** 条件061: 容量近似上位 */
export const capacityNearestAbove: ConditionEvaluator = (cadAttrs, candidates) => {
  return nearestAbove(candidates, "capacity", cadAttrs.capacity);
};

/** 条件062: 呼び容量近似上位 */
export const nominalCapacityNearestAbove: ConditionEvaluator = (cadAttrs, candidates) => {
  return nearestAbove(candidates, "nominal_capacity", cadAttrs.nominalCapacity);
};
