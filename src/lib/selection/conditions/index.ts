import type { ConditionEvaluator } from "../types";
import { formExactMatch, formPartialMatch } from "./form-conditions";
import {
  materialExactMatch,
  bodyMaterialExactMatch,
  impellerMaterialExactMatch,
} from "./material-conditions";
import { capacityNearestAbove, nominalCapacityNearestAbove } from "./range-conditions";
import {
  vendorListFilter,
  modelNumberExactMatch,
  modelNumberPartialMatch,
  recommendedFilter,
  lowestPriceFilter,
} from "./common-conditions";

/** 条件番号 → 評価関数 + 表示名のレジストリ */
export const CONDITION_REGISTRY: Record<string, { evaluator: ConditionEvaluator; name: string }> = {
  "011": { evaluator: formExactMatch, name: "形式完全一致" },
  "012": { evaluator: formPartialMatch, name: "形式部分一致" },
  "021": { evaluator: materialExactMatch, name: "材質完全一致" },
  "023": { evaluator: bodyMaterialExactMatch, name: "本体材質完全一致" },
  "025": { evaluator: impellerMaterialExactMatch, name: "要部材質完全一致" },
  "061": { evaluator: capacityNearestAbove, name: "容量近似上位" },
  "062": { evaluator: nominalCapacityNearestAbove, name: "呼び容量近似上位" },
  "191": { evaluator: vendorListFilter, name: "ベンダーリスト" },
  "192": { evaluator: modelNumberExactMatch, name: "型番完全一致" },
  "193": { evaluator: modelNumberPartialMatch, name: "型番部分一致" },
  "194": { evaluator: recommendedFilter, name: "購買推奨品" },
  "195": { evaluator: lowestPriceFilter, name: "最安値" },
};

/**
 * 条件番号から評価関数を取得
 */
export function getConditionEvaluator(
  conditionNo: string,
): { evaluator: ConditionEvaluator; name: string } | null {
  return CONDITION_REGISTRY[conditionNo] ?? null;
}
