import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// CADWorx 側ソースデータ
export const cwxData = pgTable(
  "cwx_data",
  {
    id: text("id").primaryKey(),
    jobNo: text("job_no").notNull(),
    listType: text("list_type").notNull(),
    kid: text("kid").notNull(),
    idCount: text("id_count").notNull(),
    kikiNo: text("kiki_no").notNull(),
    kikiBame: text("kiki_bame").notNull(),
    qtyOrd: text("qty_ord").notNull(),
    shortSpec: text("short_spec"),
    cwxLinkedFlg: text("cwx_linked_flg"),
  },
  (table) => [
    index("cwx_data_job_no_idx").on(table.jobNo),
    index("cwx_data_job_list_type_idx").on(table.jobNo, table.listType),
  ],
);

// T-BOM（原価管理）側ソースデータ
export const tbomData = pgTable(
  "tbom_data",
  {
    id: text("id").primaryKey(),
    jobNo: text("job_no").notNull(),
    listType: text("list_type").notNull(),
    kid: text("kid").notNull(),
    idCount: text("id_count").notNull(),
    kikiNo: text("kiki_no").notNull(),
    kikiBame: text("kiki_bame").notNull(),
    qtyOrd: text("qty_ord").notNull(),
    shortSpec: text("short_spec"),
  },
  (table) => [
    index("tbom_data_job_no_idx").on(table.jobNo),
    index("tbom_data_job_list_type_idx").on(table.jobNo, table.listType),
  ],
);

// 紐付け結果
export const linkResults = pgTable(
  "link_results",
  {
    id: text("id").primaryKey(),
    jobNo: text("job_no").notNull(),
    cadId: text("cad_id")
      .notNull()
      .references(() => cwxData.id),
    tbomId: text("tbom_id").references(() => tbomData.id),
    status: text("status", { enum: ["saved", "unsaved"] }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("link_results_job_no_idx").on(table.jobNo),
    index("link_results_cad_id_idx").on(table.cadId),
  ],
);

// リストタイプマスター
export const listTypeMaster = pgTable("list_type_master", {
  listType: text("list_type").primaryKey(),
  listName: text("list_name").notNull(),
  classification14: text("classification_14").notNull(),
});

// 工番単位の排他制御ロック
export const jobLocks = pgTable(
  "job_locks",
  {
    jobNo: text("job_no").primaryKey(),
    lockedByUserId: text("locked_by_user_id").notNull(),
    lockedByUserName: text("locked_by_user_name").notNull(),
    lockedAt: timestamp("locked_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lockToken: text("lock_token").notNull(),
  },
  (table) => [index("job_locks_expires_at_idx").on(table.expiresAt)],
);

// ────────────────────────────────────────────
// N-BOM メイン画面用テーブル
// ────────────────────────────────────────────

// フォルダ階層
export const costItemFolders = pgTable(
  "cost_item_folders",
  {
    id: text("id").primaryKey(),
    jobNo: text("job_no").notNull(),
    name: text("name").notNull(),
    parentId: text("parent_id"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("cost_item_folders_job_no_idx").on(table.jobNo),
    index("cost_item_folders_parent_id_idx").on(table.parentId),
  ],
);

// 原価項目（中核テーブル）
export const costItems = pgTable(
  "cost_items",
  {
    id: text("id").primaryKey(),
    jobNo: text("job_no").notNull(),
    name: text("name").notNull(),
    classification: text("classification"),
    subNumber: text("sub_number"),
    skidGroupNo: text("skid_group_no"),
    skidNo: text("skid_no"),
    equipmentNo: text("equipment_no"),
    shortSpec: text("short_spec"),
    maker: text("maker"),
    makerModel: text("maker_model"),
    quantity: integer("quantity").default(1).notNull(),
    unitPrice: integer("unit_price").default(0).notNull(),
    amount: integer("amount").default(0).notNull(),
    weight: real("weight"),
    volume: real("volume"),
    elFlag: boolean("el_flag").default(false).notNull(),
    flowSheetNo: text("flow_sheet_no"),
    remarks: text("remarks"),
    listType: text("list_type").references(() => listTypeMaster.listType),
    folderId: text("folder_id").references(() => costItemFolders.id),
    sortOrder: integer("sort_order").default(0).notNull(),
    estimationStatus: text("estimation_status", {
      enum: ["unestimated", "in_progress", "estimated", "confirmed"],
    })
      .default("unestimated")
      .notNull(),
    sourceType: text("source_type", {
      enum: ["link_result", "manual"],
    })
      .default("manual")
      .notNull(),
    linkResultId: text("link_result_id").references(() => linkResults.id),
    procurement: text("procurement"),
    selectedProductId: text("selected_product_id"),
    selectionStatus: text("selection_status", {
      enum: ["pending", "selected", "manual_override", "unestimated"],
    }).default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("cost_items_job_no_idx").on(table.jobNo),
    index("cost_items_folder_id_idx").on(table.folderId),
    index("cost_items_list_type_idx").on(table.listType),
    index("cost_items_link_result_id_idx").on(table.linkResultId),
  ],
);

// タグカテゴリの定義
export const tagCategoryEnum = [
  "area",
  "skid_group",
  "pressure_rating",
  "procurement",
  "equipment_type",
  "custom",
] as const;

// タグ付与
export const costItemTags = pgTable(
  "cost_item_tags",
  {
    id: text("id").primaryKey(),
    costItemId: text("cost_item_id")
      .notNull()
      .references(() => costItems.id, { onDelete: "cascade" }),
    category: text("category", {
      enum: tagCategoryEnum,
    }).notNull(),
    value: text("value").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("cost_item_tags_cost_item_id_idx").on(table.costItemId),
    index("cost_item_tags_category_value_idx").on(table.category, table.value),
  ],
);

// タグマスター
export const tagDefinitions = pgTable(
  "tag_definitions",
  {
    id: text("id").primaryKey(),
    jobNo: text("job_no").notNull(),
    category: text("category", {
      enum: tagCategoryEnum,
    }).notNull(),
    value: text("value").notNull(),
    color: text("color"),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    index("tag_definitions_job_no_idx").on(table.jobNo),
    index("tag_definitions_job_category_idx").on(table.jobNo, table.category),
  ],
);

// ────────────────────────────────────────────
// 機器選定テーブル
// ────────────────────────────────────────────

// T-BOM 製品カタログマスター
export const tbomProductCatalog = pgTable(
  "tbom_product_catalog",
  {
    id: text("id").primaryKey(),
    listType: text("list_type")
      .notNull()
      .references(() => listTypeMaster.listType),
    productName: text("product_name").notNull(),
    maker: text("maker"),
    makerModel: text("maker_model"),
    unitPrice: integer("unit_price").default(0).notNull(),
    vendorListChecked: boolean("vendor_list_checked").default(false).notNull(),
    recommended: boolean("recommended").default(false).notNull(),
    weight: real("weight"),
    volume: real("volume"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("tbom_product_catalog_list_type_idx").on(table.listType)],
);

// 製品属性（EAV パターン）
export const tbomProductAttributes = pgTable(
  "tbom_product_attributes",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => tbomProductCatalog.id, { onDelete: "cascade" }),
    attrKey: text("attr_key").notNull(),
    attrValue: text("attr_value").notNull(),
    numericValue: real("numeric_value"),
  },
  (table) => [
    index("tbom_product_attributes_product_id_idx").on(table.productId),
    index("tbom_product_attributes_key_idx").on(table.productId, table.attrKey),
  ],
);

// リストタイプ別の条件シーケンス定義
export const selectionConditionDefs = pgTable(
  "selection_condition_defs",
  {
    id: text("id").primaryKey(),
    listType: text("list_type")
      .notNull()
      .references(() => listTypeMaster.listType),
    conditionNo: text("condition_no").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isCommon: boolean("is_common").default(false).notNull(),
    config: jsonb("config"),
  },
  (table) => [index("selection_condition_defs_list_type_idx").on(table.listType)],
);

// 選定結果
export const selectionResults = pgTable(
  "selection_results",
  {
    id: text("id").primaryKey(),
    costItemId: text("cost_item_id")
      .notNull()
      .references(() => costItems.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => tbomProductCatalog.id),
    status: text("status", {
      enum: ["selected", "manual_override", "unestimated", "multiple_candidates"],
    }).notNull(),
    candidateCount: integer("candidate_count").default(0).notNull(),
    conditionLog: jsonb("condition_log"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("selection_results_cost_item_id_idx").on(table.costItemId)],
);
