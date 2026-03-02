import type { ConditionEvaluator } from "../types";

/** 条件021: 材質完全一致 */
export const materialExactMatch: ConditionEvaluator = (cadAttrs, candidates) => {
  if (!cadAttrs.material) return candidates;
  return candidates.filter(
    (p) =>
      p.attrs["material"] === cadAttrs.material || p.attrs["body_material"] === cadAttrs.material,
  );
};

/** 条件023: 本体材質完全一致 */
export const bodyMaterialExactMatch: ConditionEvaluator = (cadAttrs, candidates) => {
  if (!cadAttrs.bodyMaterial) return candidates;
  return candidates.filter((p) => p.attrs["body_material"] === cadAttrs.bodyMaterial);
};

/** 条件025: 要部材質完全一致 */
export const impellerMaterialExactMatch: ConditionEvaluator = (cadAttrs, candidates) => {
  if (!cadAttrs.impellerMaterial) return candidates;
  return candidates.filter((p) => p.attrs["impeller_material"] === cadAttrs.impellerMaterial);
};
