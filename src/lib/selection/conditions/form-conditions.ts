import type { ConditionEvaluator } from "../types";

/** 条件011: 形式完全一致 */
export const formExactMatch: ConditionEvaluator = (cadAttrs, candidates) => {
  if (!cadAttrs.form) return candidates;
  return candidates.filter((p) => p.attrs["form"] === cadAttrs.form);
};

/** 条件012: 形式部分一致 */
export const formPartialMatch: ConditionEvaluator = (cadAttrs, candidates) => {
  if (!cadAttrs.form) return candidates;
  return candidates.filter(
    (p) =>
      p.attrs["form"]?.includes(cadAttrs.form!) || cadAttrs.form!.includes(p.attrs["form"] ?? ""),
  );
};
