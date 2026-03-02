/**
 * Zod validation schemas for CSV import
 */
import { z } from "zod";

/**
 * Common fields for both CAD and T-BOM
 */
const commonFields = {
  id: z.string().min(1, "IDは必須です"),
  jobNo: z.string().min(1, "工番は必須です"),
  listType: z.string().min(1, "リストタイプは必須です"),
  kid: z.string().min(1, "KIDは必須です"),
  idCount: z.string().min(1, "ID_COUNTは必須です"),
  kikiNo: z.string().min(1, "機器番号は必須です"),
  kikiBame: z.string().min(1, "機器名称は必須です"),
  qtyOrd: z.string().min(1, "数量は必須です"),
  shortSpec: z
    .string()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
};

/**
 * CAD data (cwx_data) schema
 */
export const cwxRecordSchema = z.object({
  ...commonFields,
  cwxLinkedFlg: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === "" || val === undefined ? null : val)),
});

/**
 * T-BOM data (tbom_data) schema
 */
export const tbomRecordSchema = z.object({
  ...commonFields,
});

/**
 * Helper to get schema by data type
 */
export function getSchemaForDataType(dataType: "cad" | "tbom") {
  return dataType === "cad" ? cwxRecordSchema : tbomRecordSchema;
}

/**
 * CSV header definitions
 */
export const CSV_HEADERS = {
  cad: [
    "id",
    "jobNo",
    "listType",
    "kid",
    "idCount",
    "kikiNo",
    "kikiBame",
    "qtyOrd",
    "shortSpec",
    "cwxLinkedFlg",
  ],
  tbom: ["id", "jobNo", "listType", "kid", "idCount", "kikiNo", "kikiBame", "qtyOrd", "shortSpec"],
} as const;

/**
 * Required headers for validation
 */
export const REQUIRED_HEADERS = {
  cad: ["id", "jobNo", "listType", "kid", "idCount", "kikiNo", "kikiBame", "qtyOrd"],
  tbom: ["id", "jobNo", "listType", "kid", "idCount", "kikiNo", "kikiBame", "qtyOrd"],
} as const;
