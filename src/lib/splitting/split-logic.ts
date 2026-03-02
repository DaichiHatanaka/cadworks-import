/** 分割対象リストタイプ */
export const SPLIT_TARGET_LIST_TYPES = new Set([
  "L121",
  "L122",
  "L123",
  "L124",
  "L128",
  "L151",
  "L152",
  "L153",
  "L154",
  "L158",
  "L162",
  "L165",
  "L841",
]);

/** 末尾アルファベットを取り除いたベース文字列と末尾文字を返す */
function extractBase(str: string): { base: string; suffix: string } {
  const match = str.match(/^(.*?)([A-Za-z]+)$/);
  if (!match) return { base: str, suffix: "" };
  return { base: match[1], suffix: match[2] };
}

/**
 * 機器番号をパースして個別機器番号の配列を返す。
 * パース不能の場合は null を返す。
 */
export function parseKikiNo(kikiNo: string): string[] | null {
  // 全角チルダを半角に正規化
  const normalized = kikiNo.replace(/～/g, "~");

  // 末尾がアルファベットで終わるか確認
  if (!/[A-Za-z]$/.test(normalized)) return null;

  if (normalized.includes("~")) {
    // チルダ展開: "P-101A~C" → ["P-101A", "P-101B", "P-101C"]
    const parts = normalized.split("~");
    if (parts.length !== 2) return null;

    const startPart = parts[0];
    const endChar = parts[1].trim();

    if (!/^[A-Za-z]$/.test(endChar)) return null;

    const { base, suffix: startSuffix } = extractBase(startPart);
    if (!startSuffix || startSuffix.length !== 1) return null;

    const startCode = startSuffix.toUpperCase().charCodeAt(0);
    const endCode = endChar.toUpperCase().charCodeAt(0);

    if (startCode > endCode) return null;

    const result: string[] = [];
    for (let code = startCode; code <= endCode; code++) {
      result.push(base + String.fromCharCode(code));
    }
    return result;
  }

  if (normalized.includes(",")) {
    // カンマ分割: "P-102A,B" → ["P-102A", "P-102B"]
    const parts = normalized.split(",").map((p) => p.trim());
    if (parts.length < 2) return null;

    const { base } = extractBase(parts[0]);
    if (!base) return null;

    const result: string[] = [];
    for (const part of parts) {
      if (part.length === 1 && /[A-Za-z]/.test(part)) {
        // 単一アルファベット
        result.push(base + part.toUpperCase());
      } else {
        // 完全な機器番号（最初の要素など）
        const { suffix } = extractBase(part);
        if (!suffix || suffix.length !== 1) return null;
        result.push(base + suffix.toUpperCase());
      }
    }
    return result;
  }

  if (normalized.includes("/")) {
    // スラッシュ分割: "VF-201A/B/C" → ["VF-201A", "VF-201B", "VF-201C"]
    const parts = normalized.split("/").map((p) => p.trim());
    if (parts.length < 2) return null;

    const { base } = extractBase(parts[0]);
    if (!base) return null;

    const result: string[] = [];
    for (const part of parts) {
      if (part.length === 1 && /[A-Za-z]/.test(part)) {
        result.push(base + part.toUpperCase());
      } else {
        const { suffix } = extractBase(part);
        if (!suffix || suffix.length !== 1) return null;
        result.push(base + suffix.toUpperCase());
      }
    }
    return result;
  }

  return null;
}

/**
 * 自動分割可能かどうかを判定する。
 * 条件:
 * 1. kikiNo に ,/~～ のいずれかを含む
 * 2. kikiNo の末尾がアルファベット
 * 3. パースした台数と qtyOrd が一致
 */
export function canAutoSplit(kikiNo: string, qtyOrd: string): boolean {
  const qty = parseInt(qtyOrd, 10);
  if (isNaN(qty) || qty < 2) return false;

  const normalized = kikiNo.replace(/～/g, "~");
  const hasSeparator = /[,/~]/.test(normalized);
  if (!hasSeparator) return false;

  if (!/[A-Za-z]$/.test(normalized)) return false;

  const parsed = parseKikiNo(kikiNo);
  if (!parsed) return false;

  return parsed.length === qty;
}
