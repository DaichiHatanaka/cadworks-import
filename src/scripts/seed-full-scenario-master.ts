/**
 * full-scenario テストデータ用マスタデータ投入スクリプト
 *
 * e2e/fixtures/full-scenario-cad.csv および full-scenario-tbom.csv と
 * 対応するマスタデータ（リストタイプ、製品カタログ、選定条件）を投入する。
 *
 * 使い方:
 *   npx tsx src/scripts/seed-full-scenario-master.ts
 *
 * 前提:
 *   - .env.local に DATABASE_URL が設定済み
 *   - seed-list-type-master.ts が先に実行済み（listTypeMaster が存在すること）
 */
import { config } from "dotenv";
import { resolve } from "path";
import { getDb } from "@/db";
import {
  tbomProductCatalog,
  tbomProductAttributes,
  selectionConditionDefs,
  selectionResults,
  listTypeMaster,
} from "@/db/schema";

config({ path: resolve(process.cwd(), ".env.local") });

// ────────────────────────────────────────────
// リストタイプマスター（テストで使用する分のみ）
// ────────────────────────────────────────────
const listTypes = [
  { listType: "L002", listName: "ﾎﾟﾝﾌﾟﾘｽﾄ", classification14: "03" },
  { listType: "L009", listName: "換気扇ﾘｽﾄ", classification14: "03" },
  { listType: "L051", listName: "熱交換器ﾘｽﾄ", classification14: "03" },
  { listType: "L071", listName: "ﾍﾞｯｾﾙﾘｽﾄ", classification14: "03" },
  { listType: "L072", listName: "樹脂ﾀﾝｸﾘｽﾄ", classification14: "03" },
  { listType: "L121", listName: "流量計ﾘｽﾄ", classification14: "03" },
  { listType: "L122", listName: "圧力計･連成計･真空計ﾘｽﾄ", classification14: "03" },
  { listType: "L151", listName: "自動弁ﾘｽﾄ", classification14: "05" },
  { listType: "L152", listName: "手動弁ﾘｽﾄ", classification14: "05" },
  { listType: "L162", listName: "円錐ｽﾄﾚｰﾅｰﾘｽﾄ", classification14: "05" },
  { listType: "L841", listName: "検出器ﾘｽﾄ", classification14: "10" },
];

// ────────────────────────────────────────────
// 製品カタログ
// ────────────────────────────────────────────
interface ProductSeed {
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
  attributes: { attrKey: string; attrValue: string; numericValue?: number }[];
}

const products: ProductSeed[] = [
  // ════════════════════════════════════════
  // L002 ポンプリスト (10 製品)
  // ════════════════════════════════════════

  // --- 横型渦巻ポンプ (4 製品) ---
  {
    id: "prod-L002-001",
    listType: "L002",
    productName: "横型渦巻ポンプ SUS304 小型",
    maker: "荏原製作所",
    makerModel: "EBARA-FSA-32",
    unitPrice: 450000,
    vendorListChecked: true,
    recommended: true,
    weight: 85,
    volume: null,
    attributes: [
      { attrKey: "form", attrValue: "横型渦巻" },
      { attrKey: "body_material", attrValue: "SUS304" },
      { attrKey: "impeller_material", attrValue: "SUS304" },
      { attrKey: "capacity", attrValue: "100L", numericValue: 100 },
      { attrKey: "flow_rate", attrValue: "5.0", numericValue: 5.0 },
      { attrKey: "head", attrValue: "20", numericValue: 20 },
    ],
  },
  {
    id: "prod-L002-002",
    listType: "L002",
    productName: "横型渦巻ポンプ SUS304 中型",
    maker: "荏原製作所",
    makerModel: "EBARA-FSA-50",
    unitPrice: 680000,
    vendorListChecked: true,
    recommended: false,
    weight: 120,
    volume: null,
    attributes: [
      { attrKey: "form", attrValue: "横型渦巻" },
      { attrKey: "body_material", attrValue: "SUS304" },
      { attrKey: "impeller_material", attrValue: "SUS304" },
      { attrKey: "capacity", attrValue: "200L", numericValue: 200 },
      { attrKey: "flow_rate", attrValue: "10.0", numericValue: 10.0 },
      { attrKey: "head", attrValue: "30", numericValue: 30 },
    ],
  },
  {
    id: "prod-L002-003",
    listType: "L002",
    productName: "横型渦巻ポンプ SUS316 小型",
    maker: "荏原製作所",
    makerModel: "EBARA-FSS-32",
    unitPrice: 620000,
    vendorListChecked: true,
    recommended: false,
    weight: 88,
    volume: null,
    attributes: [
      { attrKey: "form", attrValue: "横型渦巻" },
      { attrKey: "body_material", attrValue: "SUS316" },
      { attrKey: "impeller_material", attrValue: "SUS316" },
      { attrKey: "capacity", attrValue: "100L", numericValue: 100 },
      { attrKey: "flow_rate", attrValue: "5.0", numericValue: 5.0 },
      { attrKey: "head", attrValue: "20", numericValue: 20 },
    ],
  },
  {
    id: "prod-L002-004",
    listType: "L002",
    productName: "横型渦巻ポンプ SUS316 大型",
    maker: "荏原製作所",
    makerModel: "EBARA-FSS-80",
    unitPrice: 1200000,
    vendorListChecked: false,
    recommended: false,
    weight: 250,
    volume: null,
    attributes: [
      { attrKey: "form", attrValue: "横型渦巻" },
      { attrKey: "body_material", attrValue: "SUS316" },
      { attrKey: "impeller_material", attrValue: "SUS316" },
      { attrKey: "capacity", attrValue: "500L", numericValue: 500 },
      { attrKey: "flow_rate", attrValue: "30.0", numericValue: 30.0 },
      { attrKey: "head", attrValue: "50", numericValue: 50 },
    ],
  },

  // --- ダイヤフラムポンプ (3 製品) ---
  {
    id: "prod-L002-005",
    listType: "L002",
    productName: "ダイヤフラムポンプ PP",
    maker: "ヤマダコーポレーション",
    makerModel: "YD-15PP",
    unitPrice: 280000,
    vendorListChecked: true,
    recommended: true,
    weight: 25,
    volume: null,
    attributes: [
      { attrKey: "form", attrValue: "ダイヤフラム" },
      { attrKey: "body_material", attrValue: "PP" },
      { attrKey: "impeller_material", attrValue: "PTFE" },
      { attrKey: "capacity", attrValue: "50L", numericValue: 50 },
      { attrKey: "flow_rate", attrValue: "3.0", numericValue: 3.0 },
      { attrKey: "head", attrValue: "10", numericValue: 10 },
    ],
  },
  {
    id: "prod-L002-006",
    listType: "L002",
    productName: "ダイヤフラムポンプ PVDF",
    maker: "ヤマダコーポレーション",
    makerModel: "YD-15PV",
    unitPrice: 350000,
    vendorListChecked: true,
    recommended: false,
    weight: 28,
    volume: null,
    attributes: [
      { attrKey: "form", attrValue: "ダイヤフラム" },
      { attrKey: "body_material", attrValue: "PVDF" },
      { attrKey: "impeller_material", attrValue: "PTFE" },
      { attrKey: "capacity", attrValue: "50L", numericValue: 50 },
      { attrKey: "flow_rate", attrValue: "3.0", numericValue: 3.0 },
      { attrKey: "head", attrValue: "10", numericValue: 10 },
    ],
  },
  {
    id: "prod-L002-007",
    listType: "L002",
    productName: "ダイヤフラムポンプ SUS316",
    maker: "ヤマダコーポレーション",
    makerModel: "YD-25SS",
    unitPrice: 520000,
    vendorListChecked: false,
    recommended: false,
    weight: 45,
    volume: null,
    attributes: [
      { attrKey: "form", attrValue: "ダイヤフラム" },
      { attrKey: "body_material", attrValue: "SUS316" },
      { attrKey: "impeller_material", attrValue: "PTFE" },
      { attrKey: "capacity", attrValue: "100L", numericValue: 100 },
      { attrKey: "flow_rate", attrValue: "8.0", numericValue: 8.0 },
      { attrKey: "head", attrValue: "15", numericValue: 15 },
    ],
  },

  // --- マグネットポンプ (3 製品) ---
  {
    id: "prod-L002-008",
    listType: "L002",
    productName: "マグネットポンプ PP小型",
    maker: "イワキ",
    makerModel: "MD-30R",
    unitPrice: 180000,
    vendorListChecked: true,
    recommended: true,
    weight: 15,
    volume: null,
    attributes: [
      { attrKey: "form", attrValue: "マグネット" },
      { attrKey: "body_material", attrValue: "PP" },
      { attrKey: "impeller_material", attrValue: "PP" },
      { attrKey: "capacity", attrValue: "30L", numericValue: 30 },
      { attrKey: "flow_rate", attrValue: "2.0", numericValue: 2.0 },
      { attrKey: "head", attrValue: "8", numericValue: 8 },
    ],
  },
  {
    id: "prod-L002-009",
    listType: "L002",
    productName: "マグネットポンプ PVDF中型",
    maker: "イワキ",
    makerModel: "MD-55R-PV",
    unitPrice: 320000,
    vendorListChecked: true,
    recommended: false,
    weight: 25,
    volume: null,
    attributes: [
      { attrKey: "form", attrValue: "マグネット" },
      { attrKey: "body_material", attrValue: "PVDF" },
      { attrKey: "impeller_material", attrValue: "PVDF" },
      { attrKey: "capacity", attrValue: "80L", numericValue: 80 },
      { attrKey: "flow_rate", attrValue: "5.0", numericValue: 5.0 },
      { attrKey: "head", attrValue: "15", numericValue: 15 },
    ],
  },
  {
    id: "prod-L002-010",
    listType: "L002",
    productName: "マグネットポンプ SUS316",
    maker: "イワキ",
    makerModel: "MX-70V-SS",
    unitPrice: 480000,
    vendorListChecked: false,
    recommended: false,
    weight: 35,
    volume: null,
    attributes: [
      { attrKey: "form", attrValue: "マグネット" },
      { attrKey: "body_material", attrValue: "SUS316" },
      { attrKey: "impeller_material", attrValue: "SUS316" },
      { attrKey: "capacity", attrValue: "150L", numericValue: 150 },
      { attrKey: "flow_rate", attrValue: "8.0", numericValue: 8.0 },
      { attrKey: "head", attrValue: "20", numericValue: 20 },
    ],
  },

  // ════════════════════════════════════════
  // L072 樹脂タンクリスト (6 製品)
  // ════════════════════════════════════════
  {
    id: "prod-L072-001",
    listType: "L072",
    productName: "PP製円筒型タンク 100L",
    maker: "スイコー",
    makerModel: "SK-100PP",
    unitPrice: 85000,
    vendorListChecked: true,
    recommended: true,
    weight: 15,
    volume: 100,
    attributes: [
      { attrKey: "form", attrValue: "円筒型" },
      { attrKey: "body_material", attrValue: "PP" },
      { attrKey: "nominal_capacity", attrValue: "100L", numericValue: 100 },
    ],
  },
  {
    id: "prod-L072-002",
    listType: "L072",
    productName: "PP製円筒型タンク 200L",
    maker: "スイコー",
    makerModel: "SK-200PP",
    unitPrice: 120000,
    vendorListChecked: true,
    recommended: false,
    weight: 25,
    volume: 200,
    attributes: [
      { attrKey: "form", attrValue: "円筒型" },
      { attrKey: "body_material", attrValue: "PP" },
      { attrKey: "nominal_capacity", attrValue: "200L", numericValue: 200 },
    ],
  },
  {
    id: "prod-L072-003",
    listType: "L072",
    productName: "PP製円筒型タンク 500L",
    maker: "スイコー",
    makerModel: "SK-500PP",
    unitPrice: 250000,
    vendorListChecked: true,
    recommended: false,
    weight: 50,
    volume: 500,
    attributes: [
      { attrKey: "form", attrValue: "円筒型" },
      { attrKey: "body_material", attrValue: "PP" },
      { attrKey: "nominal_capacity", attrValue: "500L", numericValue: 500 },
    ],
  },
  {
    id: "prod-L072-004",
    listType: "L072",
    productName: "PE製円筒型タンク 200L",
    maker: "ダイライト",
    makerModel: "DL-200PE",
    unitPrice: 95000,
    vendorListChecked: true,
    recommended: true,
    weight: 20,
    volume: 200,
    attributes: [
      { attrKey: "form", attrValue: "円筒型" },
      { attrKey: "body_material", attrValue: "PE" },
      { attrKey: "nominal_capacity", attrValue: "200L", numericValue: 200 },
    ],
  },
  {
    id: "prod-L072-005",
    listType: "L072",
    productName: "PVDF製角型タンク 300L",
    maker: "アグリ工業",
    makerModel: "AG-300PV",
    unitPrice: 380000,
    vendorListChecked: false,
    recommended: false,
    weight: 40,
    volume: 300,
    attributes: [
      { attrKey: "form", attrValue: "角型" },
      { attrKey: "body_material", attrValue: "PVDF" },
      { attrKey: "nominal_capacity", attrValue: "300L", numericValue: 300 },
    ],
  },
  {
    id: "prod-L072-006",
    listType: "L072",
    productName: "FRP製円筒型タンク 1000L",
    maker: "クボタケミックス",
    makerModel: "KC-1000FR",
    unitPrice: 450000,
    vendorListChecked: true,
    recommended: false,
    weight: 80,
    volume: 1000,
    attributes: [
      { attrKey: "form", attrValue: "円筒型" },
      { attrKey: "body_material", attrValue: "FRP" },
      { attrKey: "nominal_capacity", attrValue: "1000L", numericValue: 1000 },
    ],
  },

  // ════════════════════════════════════════
  // L051 熱交換器リスト (5 製品)
  // ════════════════════════════════════════
  {
    id: "prod-L051-001",
    listType: "L051",
    productName: "シェルアンドチューブ式熱交換器 SUS304",
    maker: "日阪製作所",
    makerModel: "HX-ST-100",
    unitPrice: 1500000,
    vendorListChecked: true,
    recommended: true,
    weight: 350,
    volume: null,
    attributes: [
      { attrKey: "form", attrValue: "シェルアンドチューブ" },
      { attrKey: "body_material", attrValue: "SUS304" },
      { attrKey: "capacity", attrValue: "100kW", numericValue: 100 },
    ],
  },
  {
    id: "prod-L051-002",
    listType: "L051",
    productName: "シェルアンドチューブ式熱交換器 SUS316",
    maker: "日阪製作所",
    makerModel: "HX-ST-100S",
    unitPrice: 2100000,
    vendorListChecked: true,
    recommended: false,
    weight: 360,
    volume: null,
    attributes: [
      { attrKey: "form", attrValue: "シェルアンドチューブ" },
      { attrKey: "body_material", attrValue: "SUS316" },
      { attrKey: "capacity", attrValue: "100kW", numericValue: 100 },
    ],
  },
  {
    id: "prod-L051-003",
    listType: "L051",
    productName: "プレート式熱交換器 SUS316 小型",
    maker: "アルファ・ラバル",
    makerModel: "AL-PH-50",
    unitPrice: 800000,
    vendorListChecked: true,
    recommended: true,
    weight: 80,
    volume: null,
    attributes: [
      { attrKey: "form", attrValue: "プレート式" },
      { attrKey: "body_material", attrValue: "SUS316" },
      { attrKey: "capacity", attrValue: "50kW", numericValue: 50 },
    ],
  },
  {
    id: "prod-L051-004",
    listType: "L051",
    productName: "プレート式熱交換器 SUS316 中型",
    maker: "アルファ・ラバル",
    makerModel: "AL-PH-150",
    unitPrice: 1350000,
    vendorListChecked: true,
    recommended: false,
    weight: 150,
    volume: null,
    attributes: [
      { attrKey: "form", attrValue: "プレート式" },
      { attrKey: "body_material", attrValue: "SUS316" },
      { attrKey: "capacity", attrValue: "150kW", numericValue: 150 },
    ],
  },
  {
    id: "prod-L051-005",
    listType: "L051",
    productName: "二重管式熱交換器 SUS304",
    maker: "ニッキ",
    makerModel: "NK-DT-30",
    unitPrice: 650000,
    vendorListChecked: false,
    recommended: false,
    weight: 60,
    volume: null,
    attributes: [
      { attrKey: "form", attrValue: "二重管式" },
      { attrKey: "body_material", attrValue: "SUS304" },
      { attrKey: "capacity", attrValue: "30kW", numericValue: 30 },
    ],
  },

  // ════════════════════════════════════════
  // L071 ベッセルリスト (5 製品)
  // ════════════════════════════════════════
  {
    id: "prod-L071-001",
    listType: "L071",
    productName: "SUS304 竪型ベッセル 500L",
    maker: "タニコー",
    makerModel: "TN-V500",
    unitPrice: 850000,
    vendorListChecked: true,
    recommended: true,
    weight: 200,
    volume: 500,
    attributes: [
      { attrKey: "form", attrValue: "竪型" },
      { attrKey: "body_material", attrValue: "SUS304" },
      { attrKey: "nominal_capacity", attrValue: "500L", numericValue: 500 },
    ],
  },
  {
    id: "prod-L071-002",
    listType: "L071",
    productName: "SUS304 竪型ベッセル 1000L",
    maker: "タニコー",
    makerModel: "TN-V1000",
    unitPrice: 1200000,
    vendorListChecked: true,
    recommended: false,
    weight: 380,
    volume: 1000,
    attributes: [
      { attrKey: "form", attrValue: "竪型" },
      { attrKey: "body_material", attrValue: "SUS304" },
      { attrKey: "nominal_capacity", attrValue: "1000L", numericValue: 1000 },
    ],
  },
  {
    id: "prod-L071-003",
    listType: "L071",
    productName: "SUS316 竪型ベッセル 500L",
    maker: "タニコー",
    makerModel: "TN-V500S",
    unitPrice: 1100000,
    vendorListChecked: true,
    recommended: false,
    weight: 210,
    volume: 500,
    attributes: [
      { attrKey: "form", attrValue: "竪型" },
      { attrKey: "body_material", attrValue: "SUS316" },
      { attrKey: "nominal_capacity", attrValue: "500L", numericValue: 500 },
    ],
  },
  {
    id: "prod-L071-004",
    listType: "L071",
    productName: "SUS304 横型ベッセル 2000L",
    maker: "日東金属",
    makerModel: "NT-H2000",
    unitPrice: 2500000,
    vendorListChecked: false,
    recommended: false,
    weight: 600,
    volume: 2000,
    attributes: [
      { attrKey: "form", attrValue: "横型" },
      { attrKey: "body_material", attrValue: "SUS304" },
      { attrKey: "nominal_capacity", attrValue: "2000L", numericValue: 2000 },
    ],
  },
  {
    id: "prod-L071-005",
    listType: "L071",
    productName: "SUS316L 竪型ベッセル 300L",
    maker: "日東金属",
    makerModel: "NT-V300SL",
    unitPrice: 980000,
    vendorListChecked: true,
    recommended: true,
    weight: 150,
    volume: 300,
    attributes: [
      { attrKey: "form", attrValue: "竪型" },
      { attrKey: "body_material", attrValue: "SUS316L" },
      { attrKey: "nominal_capacity", attrValue: "300L", numericValue: 300 },
    ],
  },
];

// ────────────────────────────────────────────
// 選定条件シーケンス定義
// ────────────────────────────────────────────
const conditionSequences: {
  listType: string;
  conditions: { conditionNo: string; sortOrder: number; isCommon: boolean }[];
}[] = [
  {
    // L002 ポンプ: 形式完全一致 → 本体材質 → 要部材質 → 容量 → 共通条件
    listType: "L002",
    conditions: [
      { conditionNo: "011", sortOrder: 1, isCommon: false },
      { conditionNo: "023", sortOrder: 2, isCommon: false },
      { conditionNo: "025", sortOrder: 3, isCommon: false },
      { conditionNo: "061", sortOrder: 4, isCommon: false },
      { conditionNo: "191", sortOrder: 10, isCommon: true },
      { conditionNo: "192", sortOrder: 11, isCommon: true },
      { conditionNo: "193", sortOrder: 12, isCommon: true },
      { conditionNo: "194", sortOrder: 13, isCommon: true },
      { conditionNo: "195", sortOrder: 14, isCommon: true },
    ],
  },
  {
    // L072 樹脂タンク: 形式完全一致 → 材質 → 呼び容量 → 共通条件
    listType: "L072",
    conditions: [
      { conditionNo: "011", sortOrder: 1, isCommon: false },
      { conditionNo: "021", sortOrder: 2, isCommon: false },
      { conditionNo: "062", sortOrder: 3, isCommon: false },
      { conditionNo: "191", sortOrder: 10, isCommon: true },
      { conditionNo: "192", sortOrder: 11, isCommon: true },
      { conditionNo: "193", sortOrder: 12, isCommon: true },
      { conditionNo: "194", sortOrder: 13, isCommon: true },
      { conditionNo: "195", sortOrder: 14, isCommon: true },
    ],
  },
  {
    // L051 熱交換器: 形式部分一致 → 本体材質 → 容量 → 共通条件
    listType: "L051",
    conditions: [
      { conditionNo: "012", sortOrder: 1, isCommon: false },
      { conditionNo: "023", sortOrder: 2, isCommon: false },
      { conditionNo: "061", sortOrder: 3, isCommon: false },
      { conditionNo: "191", sortOrder: 10, isCommon: true },
      { conditionNo: "192", sortOrder: 11, isCommon: true },
      { conditionNo: "193", sortOrder: 12, isCommon: true },
      { conditionNo: "194", sortOrder: 13, isCommon: true },
      { conditionNo: "195", sortOrder: 14, isCommon: true },
    ],
  },
  {
    // L071 ベッセル: 形式部分一致 → 呼び容量 → 共通条件
    listType: "L071",
    conditions: [
      { conditionNo: "012", sortOrder: 1, isCommon: false },
      { conditionNo: "062", sortOrder: 2, isCommon: false },
      { conditionNo: "191", sortOrder: 10, isCommon: true },
      { conditionNo: "192", sortOrder: 11, isCommon: true },
      { conditionNo: "193", sortOrder: 12, isCommon: true },
      { conditionNo: "194", sortOrder: 13, isCommon: true },
      { conditionNo: "195", sortOrder: 14, isCommon: true },
    ],
  },
];

// ────────────────────────────────────────────
// 投入実行
// ────────────────────────────────────────────
async function seedFullScenarioMaster() {
  const db = getDb();

  console.log("=== Full Scenario マスタデータ投入 ===\n");

  // 1. リストタイプマスター（upsert）
  console.log("1/3 リストタイプマスター...");
  for (const lt of listTypes) {
    await db
      .insert(listTypeMaster)
      .values(lt)
      .onConflictDoNothing({ target: listTypeMaster.listType });
  }
  console.log(`  ${listTypes.length} 件確認/投入完了\n`);

  // 2. 製品カタログ + 属性（既存を削除して再投入）
  console.log("2/3 製品カタログ + 属性...");
  await db.delete(selectionResults);
  await db.delete(tbomProductAttributes);
  await db.delete(tbomProductCatalog);

  for (const prod of products) {
    await db.insert(tbomProductCatalog).values({
      id: prod.id,
      listType: prod.listType,
      productName: prod.productName,
      maker: prod.maker,
      makerModel: prod.makerModel,
      unitPrice: prod.unitPrice,
      vendorListChecked: prod.vendorListChecked,
      recommended: prod.recommended,
      weight: prod.weight,
      volume: prod.volume,
    });

    for (let i = 0; i < prod.attributes.length; i++) {
      const attr = prod.attributes[i];
      await db.insert(tbomProductAttributes).values({
        id: `${prod.id}-attr-${i}`,
        productId: prod.id,
        attrKey: attr.attrKey,
        attrValue: attr.attrValue,
        numericValue: attr.numericValue ?? null,
      });
    }
  }
  console.log(`  ${products.length} 製品投入完了\n`);

  // 3. 選定条件シーケンス
  console.log("3/3 選定条件シーケンス...");
  await db.delete(selectionConditionDefs);

  let condCount = 0;
  for (const seq of conditionSequences) {
    for (const cond of seq.conditions) {
      await db.insert(selectionConditionDefs).values({
        id: `cond-${seq.listType}-${cond.conditionNo}`,
        listType: seq.listType,
        conditionNo: cond.conditionNo,
        sortOrder: cond.sortOrder,
        isCommon: cond.isCommon,
        config: null,
      });
      condCount++;
    }
  }
  console.log(`  ${condCount} 条件定義投入完了\n`);

  console.log("=== 全マスタデータ投入完了 ===");
}

seedFullScenarioMaster()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("エラー:", err);
    process.exit(1);
  });
