import type { ParsedAttributes } from "./types";

/** 既知の材質コード辞書 */
const KNOWN_MATERIALS = [
  "SUS316L",
  "SUS316",
  "SUS304L",
  "SUS304",
  "SUS310S",
  "PVDF",
  "PP",
  "PE",
  "PVC",
  "FRP",
  "CS",
  "PTFE",
  "EPDM",
  "NBR",
  "FKM",
  "Ti",
  "ハステロイ",
  "インコネル",
  "モネル",
  "鋳鉄",
  "鋳鋼",
  "炭素鋼",
  "ステンレス",
];

/** 既知の形式名辞書 */
const KNOWN_FORMS = [
  "横型渦巻",
  "縦型渦巻",
  "渦巻ポンプ",
  "ダイヤフラム",
  "ダイアフラム",
  "マグネットポンプ",
  "マグネット",
  "ギヤポンプ",
  "プランジャ",
  "Air駆動",
  "エア駆動",
  "自吸式",
  "水中ポンプ",
  "キャンド",
  "多段式",
  "シェルアンドチューブ",
  "プレート式",
  "二重管式",
  "コイル式",
  "スパイラル式",
  "円筒型",
  "角型",
  "竪型",
  "横型",
  "円錐底",
  "平底",
  "FRP製",
  "PP製",
  "PE製",
];

/**
 * shortSpec テキストから構造化属性をパースする
 *
 * 例:
 * "横型渦巻ポンプ SUS304 Q=5.0m3/h H=20m"
 *  → { form: "横型渦巻", bodyMaterial: "SUS304", flowRate: 5.0, head: 20 }
 */
export function parseShortSpec(shortSpec: string | null | undefined): ParsedAttributes {
  const result: ParsedAttributes = {
    form: null,
    bodyMaterial: null,
    impellerMaterial: null,
    material: null,
    capacity: null,
    nominalCapacity: null,
    flowRate: null,
    head: null,
    modelNumber: null,
  };

  if (!shortSpec) return result;

  const text = shortSpec.trim();

  // 形式抽出（長い名称から先にマッチ）
  const sortedForms = [...KNOWN_FORMS].sort((a, b) => b.length - a.length);
  for (const form of sortedForms) {
    if (text.includes(form)) {
      result.form = form;
      break;
    }
  }

  // 材質抽出（長い名称から先にマッチ）
  const sortedMaterials = [...KNOWN_MATERIALS].sort((a, b) => b.length - a.length);
  const foundMaterials: string[] = [];
  for (const mat of sortedMaterials) {
    if (text.includes(mat)) {
      foundMaterials.push(mat);
    }
  }

  if (foundMaterials.length >= 1) {
    result.bodyMaterial = foundMaterials[0];
    result.material = foundMaterials[0];
  }
  if (foundMaterials.length >= 2) {
    result.impellerMaterial = foundMaterials[1];
  }

  // 流量 Q=xxx m3/h
  const flowMatch = text.match(/Q\s*=\s*(\d+\.?\d*)\s*m3\/h/i);
  if (flowMatch) {
    result.flowRate = parseFloat(flowMatch[1]);
  }

  // 揚程 H=xxx m
  const headMatch = text.match(/H\s*=\s*(\d+\.?\d*)\s*m(?!\d|3)/i);
  if (headMatch) {
    result.head = parseFloat(headMatch[1]);
  }

  // 容量 V=xxx L or xxx m3 or 容量xxxL
  const capMatchL = text.match(/(?:V\s*=\s*|容量\s*)(\d+\.?\d*)\s*[Ll]/);
  if (capMatchL) {
    result.capacity = parseFloat(capMatchL[1]);
  }
  const capMatchM3 = text.match(/(?:V\s*=\s*|容量\s*)(\d+\.?\d*)\s*m3/);
  if (capMatchM3) {
    result.capacity = parseFloat(capMatchM3[1]) * 1000; // m3 → L
  }

  // 呼び容量
  const nomCapMatch = text.match(/呼び容量\s*(\d+\.?\d*)\s*[Ll]/);
  if (nomCapMatch) {
    result.nominalCapacity = parseFloat(nomCapMatch[1]);
  }

  // 型番（メーカー型番っぽいパターン: 英数字+ハイフン）
  const modelMatch = text.match(/\b([A-Z]{2,}[\-_][\w\-]+)\b/);
  if (modelMatch) {
    result.modelNumber = modelMatch[1];
  }

  return result;
}
