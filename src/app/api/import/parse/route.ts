/**
 * POST /api/import/parse
 * Parse CSV file and return validation results
 */
import { NextResponse } from "next/server";
import { parseCSV, validateFile } from "@/lib/csv/parser";
import type { DataType } from "@/lib/csv/types";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const dataType = formData.get("dataType") as DataType | null;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "ファイルが選択されていません",
        },
        { status: 400 },
      );
    }

    if (!dataType || !["cad", "tbom"].includes(dataType)) {
      return NextResponse.json(
        {
          success: false,
          error: "データタイプが不正です",
        },
        { status: 400 },
      );
    }

    // Validate file
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: fileValidation.error,
        },
        { status: 400 },
      );
    }

    // Parse CSV
    const result = await parseCSV(file, dataType);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          rowCount: result.rowCount,
          validRows: result.validRows,
          errors: result.errors,
          warnings: result.warnings,
        },
        { status: 200 }, // Return 200 with validation errors
      );
    }

    return NextResponse.json({
      success: true,
      rowCount: result.rowCount,
      validRows: result.validRows,
      errors: result.errors,
      warnings: result.warnings,
    });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "サーバーエラーが発生しました",
        details: error instanceof Error ? error.message : "予期しないエラー",
      },
      { status: 500 },
    );
  }
}
