/**
 * CSV Import Types
 */

/**
 * Data type for import
 */
export type DataType = "cad" | "tbom";

/**
 * CAD data record (cwx_data)
 */
export interface CwxRecord {
  id: string;
  jobNo: string;
  listType: string;
  kid: string;
  idCount: string;
  kikiNo: string;
  kikiBame: string;
  qtyOrd: string;
  shortSpec: string | null;
  cwxLinkedFlg: string | null;
}

/**
 * T-BOM data record (tbom_data)
 */
export interface TbomRecord {
  id: string;
  jobNo: string;
  listType: string;
  kid: string;
  idCount: string;
  kikiNo: string;
  kikiBame: string;
  qtyOrd: string;
  shortSpec: string | null;
}

/**
 * Combined record type for parsing
 */
export type CsvRecord = CwxRecord | TbomRecord;

/**
 * Validation error
 */
export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  row: number;
  message: string;
}

/**
 * CSV parsing result
 */
export interface ParseResult {
  success: boolean;
  rowCount: number;
  validRows: CsvRecord[];
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Import execution result
 */
export interface ImportResult {
  success: boolean;
  insertedCount?: number;
  jobNo?: string;
  error?: string;
  conflictingJobNo?: string;
}
