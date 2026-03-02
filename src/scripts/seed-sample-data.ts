import { config } from "dotenv";
import { resolve } from "path";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { cwxData, tbomData } from "@/db/schema";

// 環境変数の読み込み
config({ path: resolve(process.cwd(), ".env.local") });

async function seedSampleData() {
  const db = getDb();

  console.log("🌱 サンプルデータを投入中...");

  // CWX データ（CADWorx側）のサンプル - 12件
  // L002 (ﾎﾟﾝﾌﾟﾘｽﾄ) と L009 (換気扇ﾘｽﾄ) の2リストタイプで構成
  // CAD側は常に1台ずつ登録されるため qtyOrd は全て "1"
  // 意図的に一部のデータを微妙に異なるものにして、手動紐付けを体験できるようにする
  const cwxSamples = [
    // L002 完全一致グループ（自動マッチング対象）- 3件
    {
      id: "cwx-001",
      jobNo: "2024-001",
      listType: "L002",
      kid: "K001",
      idCount: "1",
      kikiNo: "P-001",
      kikiBame: "ポンプ",
      qtyOrd: "1",
      shortSpec: "遠心ポンプ 5kW",
      cwxLinkedFlg: null,
    },
    {
      id: "cwx-002",
      jobNo: "2024-001",
      listType: "L002",
      kid: "K002",
      idCount: "1",
      kikiNo: "P-002",
      kikiBame: "真空ポンプ",
      qtyOrd: "1",
      shortSpec: "液封式 1.5kW",
      cwxLinkedFlg: null,
    },
    {
      id: "cwx-003",
      jobNo: "2024-001",
      listType: "L002",
      kid: "K003",
      idCount: "1",
      kikiNo: "P-003",
      kikiBame: "薬注ポンプ",
      qtyOrd: "1",
      shortSpec: "電磁式 0.5kW",
      cwxLinkedFlg: null,
    },

    // L002 部分一致グループ（手動紐付けが必要）- 2件
    {
      id: "cwx-004",
      jobNo: "2024-001",
      listType: "L002",
      kid: "K010",
      idCount: "1",
      kikiNo: "P-010",
      kikiBame: "送液ポンプ",
      qtyOrd: "1",
      shortSpec: "マグネット式 0.4kW",
      cwxLinkedFlg: null,
    },
    {
      id: "cwx-005",
      jobNo: "2024-001",
      listType: "L002",
      kid: "K011",
      idCount: "1",
      kikiNo: "P-011",
      kikiBame: "循環ポンプ",
      qtyOrd: "1",
      shortSpec: "インライン型 2.2kW",
      cwxLinkedFlg: null,
    },

    // L009 部分一致グループ（手動紐付けが必要）- 3件
    {
      id: "cwx-006",
      jobNo: "2024-001",
      listType: "L009",
      kid: "K020",
      idCount: "1",
      kikiNo: "VF-001",
      kikiBame: "換気扇",
      qtyOrd: "1",
      shortSpec: "天井埋込型 150φ",
      cwxLinkedFlg: null,
    },
    {
      id: "cwx-007",
      jobNo: "2024-001",
      listType: "L009",
      kid: "K021",
      idCount: "1",
      kikiNo: "VF-002",
      kikiBame: "排気ファン",
      qtyOrd: "1",
      shortSpec: "壁付型 200φ",
      cwxLinkedFlg: null,
    },
    {
      id: "cwx-008",
      jobNo: "2024-001",
      listType: "L009",
      kid: "K022",
      idCount: "1",
      kikiNo: "VF-003",
      kikiBame: "給気ファン",
      qtyOrd: "1",
      shortSpec: "天井型 300φ",
      cwxLinkedFlg: null,
    },

    // CWX のみ存在（TBOM側にない）- 4件
    {
      id: "cwx-009",
      jobNo: "2024-001",
      listType: "L002",
      kid: "K030",
      idCount: "1",
      kikiNo: "P-020",
      kikiBame: "汚泥ポンプ",
      qtyOrd: "1",
      shortSpec: "水中型 0.75kW",
      cwxLinkedFlg: null,
    },
    {
      id: "cwx-010",
      jobNo: "2024-001",
      listType: "L002",
      kid: "K031",
      idCount: "1",
      kikiNo: "P-021",
      kikiBame: "消火ポンプ",
      qtyOrd: "1",
      shortSpec: "消火補助 7.5kW",
      cwxLinkedFlg: null,
    },
    {
      id: "cwx-011",
      jobNo: "2024-001",
      listType: "L009",
      kid: "K040",
      idCount: "1",
      kikiNo: "VF-010",
      kikiBame: "屋上換気扇",
      qtyOrd: "1",
      shortSpec: "排煙兼用型",
      cwxLinkedFlg: null,
    },
    {
      id: "cwx-012",
      jobNo: "2024-001",
      listType: "L009",
      kid: "K041",
      idCount: "1",
      kikiNo: "VF-011",
      kikiBame: "トイレ換気扇",
      qtyOrd: "1",
      shortSpec: "24時間換気対応",
      cwxLinkedFlg: null,
    },
  ];

  // TBOM データ（原価管理側）のサンプル - 12件
  // CWXと対応関係を持たせつつ、手動紐付けが必要になるように差異を設ける
  const tbomSamples = [
    // L002 完全一致グループ（自動マッチング対象）- 3件
    {
      id: "tbom-001",
      jobNo: "2024-001",
      listType: "L002",
      kid: "K001",
      idCount: "1",
      kikiNo: "P-001",
      kikiBame: "ポンプ",
      qtyOrd: "2",
      shortSpec: "遠心ポンプ 5kW",
    },
    {
      id: "tbom-002",
      jobNo: "2024-001",
      listType: "L002",
      kid: "K002",
      idCount: "1",
      kikiNo: "P-002",
      kikiBame: "真空ポンプ",
      qtyOrd: "1",
      shortSpec: "液封式 1.5kW",
    },
    {
      id: "tbom-003",
      jobNo: "2024-001",
      listType: "L002",
      kid: "K003",
      idCount: "1",
      kikiNo: "P-003",
      kikiBame: "薬注ポンプ",
      qtyOrd: "3",
      shortSpec: "電磁式 0.5kW",
    },

    // L002 部分一致グループ（KIDは一致するが仕様が微妙に異なる）- 2件
    {
      id: "tbom-004",
      jobNo: "2024-001",
      listType: "L002",
      kid: "K010",
      idCount: "1",
      kikiNo: "P-010",
      kikiBame: "送液ポンプ装置",
      qtyOrd: "2",
      shortSpec: "マグネット式",
    },
    {
      id: "tbom-005",
      jobNo: "2024-001",
      listType: "L002",
      kid: "K011",
      idCount: "1",
      kikiNo: "P-011A",
      kikiBame: "循環ポンプ",
      qtyOrd: "1",
      shortSpec: "インライン型 2.2kW",
    },

    // L009 部分一致グループ（KIDは一致するが仕様が微妙に異なる）- 3件
    {
      id: "tbom-006",
      jobNo: "2024-001",
      listType: "L009",
      kid: "K020",
      idCount: "1",
      kikiNo: "VF-001",
      kikiBame: "換気扇 大型",
      qtyOrd: "4",
      shortSpec: "天井埋込型",
    },
    {
      id: "tbom-007",
      jobNo: "2024-001",
      listType: "L009",
      kid: "K021",
      idCount: "1",
      kikiNo: "VF-002A",
      kikiBame: "排気ファン",
      qtyOrd: "2",
      shortSpec: "壁付型 200φ",
    },
    {
      id: "tbom-008",
      jobNo: "2024-001",
      listType: "L009",
      kid: "K022",
      idCount: "1",
      kikiNo: "VF-003",
      kikiBame: "送風ファン",
      qtyOrd: "2",
      shortSpec: "天井型 300φ",
    },

    // TBOM のみ存在（CAD側にない）- 4件
    {
      id: "tbom-009",
      jobNo: "2024-001",
      listType: "L002",
      kid: "K050",
      idCount: "1",
      kikiNo: "P-030",
      kikiBame: "予備ポンプ",
      qtyOrd: "1",
      shortSpec: "スペア用 5kW",
    },
    {
      id: "tbom-010",
      jobNo: "2024-001",
      listType: "L002",
      kid: "K051",
      idCount: "1",
      kikiNo: "P-031",
      kikiBame: "ブースターポンプ",
      qtyOrd: "1",
      shortSpec: "加圧用 3.7kW",
    },
    {
      id: "tbom-011",
      jobNo: "2024-001",
      listType: "L009",
      kid: "K060",
      idCount: "1",
      kikiNo: "VF-020",
      kikiBame: "工場換気扇",
      qtyOrd: "1",
      shortSpec: "大型 500φ",
    },
    {
      id: "tbom-012",
      jobNo: "2024-001",
      listType: "L009",
      kid: "K061",
      idCount: "1",
      kikiNo: "VF-021",
      kikiBame: "地下換気扇",
      qtyOrd: "1",
      shortSpec: "防爆型 200φ",
    },

    // 機器分割対象データ（L121/L122/L151 - 分割対象リストタイプ）- 7件
    // 自動分割可能ケース
    {
      id: "tbom-split-001",
      jobNo: "2024-001",
      listType: "L121",
      kid: "K100",
      idCount: "1",
      kikiNo: "P-101A~C",
      kikiBame: "遠心ポンプ",
      qtyOrd: "3",
      shortSpec: "高圧型 15kW",
    },
    {
      id: "tbom-split-002",
      jobNo: "2024-001",
      listType: "L121",
      kid: "K101",
      idCount: "1",
      kikiNo: "P-102A,B",
      kikiBame: "給水ポンプ",
      qtyOrd: "2",
      shortSpec: "インライン型 7.5kW",
    },
    {
      id: "tbom-split-003",
      jobNo: "2024-001",
      listType: "L122",
      kid: "K102",
      idCount: "1",
      kikiNo: "VF-201A/B/C",
      kikiBame: "排気ファン",
      qtyOrd: "3",
      shortSpec: "壁付型 300φ",
    },
    {
      id: "tbom-split-004",
      jobNo: "2024-001",
      listType: "L151",
      kid: "K103",
      idCount: "1",
      kikiNo: "P-301A～D",
      kikiBame: "冷却水ポンプ",
      qtyOrd: "4",
      shortSpec: "横型 22kW",
    },
    // 手動対応が必要なケース
    {
      id: "tbom-split-005",
      jobNo: "2024-001",
      listType: "L121",
      kid: "K104",
      idCount: "1",
      kikiNo: "P-401",
      kikiBame: "循環ポンプ",
      qtyOrd: "2",
      shortSpec: "区切り記号なし",
    },
    {
      id: "tbom-split-006",
      jobNo: "2024-001",
      listType: "L122",
      kid: "K105",
      idCount: "1",
      kikiNo: "EP-5201A-C",
      kikiBame: "換気扇",
      qtyOrd: "3",
      shortSpec: "ハイフンのみで区切りなし",
    },
    {
      id: "tbom-split-007",
      jobNo: "2024-001",
      listType: "L121",
      kid: "K106",
      idCount: "1",
      kikiNo: "1P-K10421A~D",
      kikiBame: "薬液ポンプ",
      qtyOrd: "3",
      shortSpec: "A~D=4台だが数量は3で不一致",
    },
  ];

  try {
    // 既存データのクリーンアップ（工番 2024-001 のデータのみ）
    console.log("  🧹 既存のサンプルデータをクリーンアップ中...");
    await db.delete(cwxData).where(eq(cwxData.jobNo, "2024-001"));
    await db.delete(tbomData).where(eq(tbomData.jobNo, "2024-001"));
    console.log("  ✓ クリーンアップ完了");

    // CWX データの投入
    console.log("  ✓ CWX データを投入中...");
    for (const record of cwxSamples) {
      await db.insert(cwxData).values(record);
    }
    console.log(`  ✓ CWX データ ${cwxSamples.length} 件投入完了`);

    // TBOM データの投入
    console.log("  ✓ TBOM データを投入中...");
    for (const record of tbomSamples) {
      await db.insert(tbomData).values(record);
    }
    console.log(`  ✓ TBOM データ ${tbomSamples.length} 件投入完了`);

    console.log("✅ サンプルデータの投入が完了しました");
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    throw error;
  }
}

// スクリプトとして実行
seedSampleData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
