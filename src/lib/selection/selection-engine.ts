import type {
  SelectionInput,
  SelectionOutput,
  ConditionLogEntry,
  ProductWithAttributes,
} from "./types";
import { getConditionEvaluator } from "./conditions";

/**
 * 機器選定メインパイプライン
 *
 * 1. AND 条件（isCommon=false, 011〜165）を順次適用
 *    - 候補0件 → 「未積算」で終了
 *    - 候補1件 → 「選定完了」で終了
 * 2. OR 条件（isCommon=true, 191〜195）を順次適用
 *    - 候補0件 → スキップして前の候補に戻す
 *    - 候補1件 → 「選定完了」で終了
 * 3. 全条件適用後も複数 → 「複数候補」
 */
export function executeSelection(input: SelectionInput): SelectionOutput {
  const { cadAttributes, candidates, conditionSequence } = input;
  const conditionLog: ConditionLogEntry[] = [];

  if (candidates.length === 0) {
    return {
      status: "unestimated",
      selectedProduct: null,
      candidateCount: 0,
      conditionLog: [],
    };
  }

  // 条件をソート順に並べる
  const sorted = [...conditionSequence].sort((a, b) => a.sortOrder - b.sortOrder);

  // AND 条件と OR 条件を分離
  const andConditions = sorted.filter((c) => !c.isCommon);
  const orConditions = sorted.filter((c) => c.isCommon);

  // Phase 1: AND 条件を順次適用
  let current: ProductWithAttributes[] = [...candidates];

  for (const cond of andConditions) {
    const entry = getConditionEvaluator(cond.conditionNo);
    if (!entry) continue;

    const inputCount = current.length;
    const filtered = entry.evaluator(cadAttributes, current);

    conditionLog.push({
      conditionNo: cond.conditionNo,
      conditionName: entry.name,
      inputCount,
      outputCount: filtered.length,
      isCommon: false,
    });

    if (filtered.length === 0) {
      return {
        status: "unestimated",
        selectedProduct: null,
        candidateCount: 0,
        conditionLog,
      };
    }

    current = filtered;

    if (current.length === 1) {
      return {
        status: "selected",
        selectedProduct: current[0],
        candidateCount: 1,
        conditionLog,
      };
    }
  }

  // Phase 2: OR 条件（共通条件）を順次適用
  for (const cond of orConditions) {
    const entry = getConditionEvaluator(cond.conditionNo);
    if (!entry) continue;

    const inputCount = current.length;
    const filtered = entry.evaluator(cadAttributes, current);

    conditionLog.push({
      conditionNo: cond.conditionNo,
      conditionName: entry.name,
      inputCount,
      outputCount: filtered.length,
      isCommon: true,
    });

    // OR 条件: 0件ならスキップ（前の候補を保持）
    if (filtered.length === 0) {
      continue;
    }

    current = filtered;

    if (current.length === 1) {
      return {
        status: "selected",
        selectedProduct: current[0],
        candidateCount: 1,
        conditionLog,
      };
    }
  }

  // 全条件適用後も複数候補が残っている
  return {
    status: "multiple_candidates",
    selectedProduct: null,
    candidateCount: current.length,
    conditionLog,
  };
}
