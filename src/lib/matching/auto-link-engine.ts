import type { AutoLinkResult, CwxRecord, LinkedPair, TbomRecord } from "./types";

/**
 * ID_COUNT の下5桁を取得する。
 * 5桁未満の場合はゼロ埋めして5桁にする。
 */
function getLast5Digits(idCount: string): string {
  return idCount.padStart(5, "0").slice(-5);
}

/**
 * CAD レコードを起点に T-BOM レコードとの自動紐付けを実行する純粋関数。
 *
 * マッチングルール:
 * 1. LIST_TYPE が一致する T-BOM レコードから KID で対応先を探索
 * 2. ID_COUNT が完全一致 → "unsaved" ステータス（確信度: 高）
 * 3. ID_COUNT の下5桁が一致 → "unsaved" ステータス
 * 4. それ以外 → 未紐付け
 */
export function executeAutoLink(
  cadRecords: CwxRecord[],
  tbomRecords: TbomRecord[],
): AutoLinkResult {
  const linkedPairs: LinkedPair[] = [];
  const matchedTbomIds = new Set<string>();

  // T-BOM を LIST_TYPE + KID でグループ化（高速検索用）
  const tbomIndex = new Map<string, TbomRecord[]>();
  for (const tbom of tbomRecords) {
    const key = `${tbom.listType}::${tbom.kid}`;
    const group = tbomIndex.get(key);
    if (group) {
      group.push(tbom);
    } else {
      tbomIndex.set(key, [tbom]);
    }
  }

  let pairCounter = 0;

  for (const cad of cadRecords) {
    const key = `${cad.listType}::${cad.kid}`;
    const candidates = tbomIndex.get(key);

    if (!candidates) {
      continue;
    }

    // 完全一致を優先探索
    const exactMatch = candidates.find(
      (t) => !matchedTbomIds.has(t.id) && t.idCount === cad.idCount,
    );

    if (exactMatch) {
      pairCounter++;
      linkedPairs.push({
        id: `auto-link-${pairCounter}`,
        cad,
        tbom: exactMatch,
        status: "unsaved",
      });
      matchedTbomIds.add(exactMatch.id);
      continue;
    }

    // 下5桁一致を探索
    const cadLast5 = getLast5Digits(cad.idCount);
    const partialMatch = candidates.find(
      (t) => !matchedTbomIds.has(t.id) && getLast5Digits(t.idCount) === cadLast5,
    );

    if (partialMatch) {
      pairCounter++;
      linkedPairs.push({
        id: `auto-link-${pairCounter}`,
        cad,
        tbom: partialMatch,
        status: "unsaved",
      });
      matchedTbomIds.add(partialMatch.id);
    }
  }

  // マッチしなかった CAD レコード
  const linkedCadIds = new Set(linkedPairs.map((p) => p.cad.id));
  const unlinkedCad = cadRecords.filter((c) => !linkedCadIds.has(c.id));

  // マッチしなかった T-BOM レコード
  const unlinkedTbom = tbomRecords.filter((t) => !matchedTbomIds.has(t.id));

  return { linkedPairs, unlinkedCad, unlinkedTbom };
}
