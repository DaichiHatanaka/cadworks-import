/**
 * CSV validation helper functions
 */
import type { CsvRecord, ValidationError, ValidationWarning } from "./types";

/**
 * Check for duplicate IDs within the CSV data
 */
export function checkDuplicateIds(records: CsvRecord[]): {
  errors: ValidationError[];
  warnings: ValidationWarning[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const idMap = new Map<string, number[]>();

  records.forEach((record, index) => {
    const rowNumber = index + 2; // +2 for 1-based indexing and header row
    const id = record.id;

    if (!idMap.has(id)) {
      idMap.set(id, [rowNumber]);
    } else {
      idMap.get(id)!.push(rowNumber);
    }
  });

  // Find duplicates
  for (const [id, rows] of idMap.entries()) {
    if (rows.length > 1) {
      rows.forEach((row) => {
        errors.push({
          row,
          field: "id",
          message: `ID "${id}" が重複しています（行: ${rows.join(", ")}）`,
        });
      });
    }
  }

  return { errors, warnings };
}

/**
 * Check jobNo consistency across all records
 */
export function checkJobNoConsistency(records: CsvRecord[]): {
  errors: ValidationError[];
  warnings: ValidationWarning[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (records.length === 0) {
    return { errors, warnings };
  }

  const firstJobNo = records[0]?.jobNo;
  if (!firstJobNo) {
    return { errors, warnings };
  }

  records.forEach((record, index) => {
    const rowNumber = index + 2;
    if (record.jobNo !== firstJobNo) {
      errors.push({
        row: rowNumber,
        field: "jobNo",
        message: `工番が一貫していません。期待値: "${firstJobNo}", 実際: "${record.jobNo}"`,
      });
    }
  });

  return { errors, warnings };
}

/**
 * Check for empty rows
 */
export function checkEmptyRows(data: unknown[]): {
  errors: ValidationError[];
  warnings: ValidationWarning[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    if (typeof row === "object" && row !== null && Object.values(row).every((val) => !val)) {
      warnings.push({
        row: rowNumber,
        message: "空の行があります（スキップされました）",
      });
    }
  });

  return { errors, warnings };
}
