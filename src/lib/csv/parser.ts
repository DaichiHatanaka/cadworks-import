/**
 * CSV parsing and validation logic
 */
import Papa from "papaparse";
import { ZodError } from "zod";
import { getSchemaForDataType, REQUIRED_HEADERS } from "./schemas";
import type { CsvRecord, DataType, ParseResult, ValidationError, ValidationWarning } from "./types";
import { checkDuplicateIds, checkEmptyRows, checkJobNoConsistency } from "./validator";

/**
 * Parse CSV file and validate data
 */
export async function parseCSV(file: File, dataType: DataType): Promise<ParseResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const validRows: CsvRecord[] = [];

  try {
    // Parse CSV file
    const csvText = await file.text();
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
    });

    if (parseResult.errors.length > 0) {
      parseResult.errors.forEach((error) => {
        errors.push({
          row: error.row ? error.row + 2 : 1,
          field: "CSV",
          message: `CSV解析エラー: ${error.message}`,
        });
      });
    }

    const data = parseResult.data as Record<string, string>[];

    // Check for empty rows
    const emptyRowCheck = checkEmptyRows(data);
    warnings.push(...emptyRowCheck.warnings);

    // Validate headers
    const headerErrors = validateHeaders(parseResult.meta.fields || [], dataType);
    if (headerErrors.length > 0) {
      return {
        success: false,
        rowCount: 0,
        validRows: [],
        errors: headerErrors,
        warnings,
      };
    }

    // Validate each row
    const schema = getSchemaForDataType(dataType);

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 for 1-based indexing and header row

      // Skip empty rows
      if (Object.values(row).every((val) => !val)) {
        return;
      }

      try {
        const validatedRow = schema.parse(row);
        validRows.push(validatedRow as CsvRecord);
      } catch (err) {
        if (err instanceof ZodError) {
          err.errors.forEach((zodError) => {
            errors.push({
              row: rowNumber,
              field: zodError.path.join("."),
              message: zodError.message,
            });
          });
        } else {
          errors.push({
            row: rowNumber,
            field: "unknown",
            message: "予期しないエラーが発生しました",
          });
        }
      }
    });

    // Business logic validation
    if (validRows.length > 0) {
      // Check for duplicate IDs
      const duplicateCheck = checkDuplicateIds(validRows);
      errors.push(...duplicateCheck.errors);
      warnings.push(...duplicateCheck.warnings);

      // Check jobNo consistency
      const jobNoCheck = checkJobNoConsistency(validRows);
      errors.push(...jobNoCheck.errors);
      warnings.push(...jobNoCheck.warnings);
    }

    return {
      success: errors.length === 0,
      rowCount: validRows.length,
      validRows: errors.length === 0 ? validRows : [],
      errors,
      warnings,
    };
  } catch (err) {
    return {
      success: false,
      rowCount: 0,
      validRows: [],
      errors: [
        {
          row: 0,
          field: "file",
          message:
            err instanceof Error
              ? `ファイル処理エラー: ${err.message}`
              : "ファイル処理エラーが発生しました",
        },
      ],
      warnings,
    };
  }
}

/**
 * Validate CSV headers
 */
function validateHeaders(actualHeaders: string[], dataType: DataType): ValidationError[] {
  const errors: ValidationError[] = [];
  const requiredHeaders = REQUIRED_HEADERS[dataType];

  const missingHeaders = requiredHeaders.filter((header) => !actualHeaders.includes(header));

  if (missingHeaders.length > 0) {
    errors.push({
      row: 1,
      field: "headers",
      message: `必須ヘッダーが不足しています: ${missingHeaders.join(", ")}`,
    });
  }

  return errors;
}

/**
 * Convert file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Validate file type and size
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.name.endsWith(".csv")) {
    return {
      valid: false,
      error: "CSVファイルのみアップロード可能です",
    };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `ファイルサイズが大きすぎます（最大: 10MB, 実際: ${formatFileSize(file.size)}）`,
    };
  }

  return { valid: true };
}
