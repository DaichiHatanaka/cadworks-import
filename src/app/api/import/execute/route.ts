/**
 * POST /api/import/execute
 * Execute import and save data to database
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { cwxData, tbomData } from "@/db/schema";
import type { CsvRecord, DataType } from "@/lib/csv/types";

interface ExecuteRequest {
  dataType: DataType;
  jobNo: string;
  rows: CsvRecord[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExecuteRequest;
    const { dataType, jobNo, rows } = body;

    // Validate inputs
    if (!dataType || !["cad", "tbom"].includes(dataType)) {
      return NextResponse.json(
        {
          success: false,
          error: "データタイプが不正です",
        },
        { status: 400 },
      );
    }

    if (!jobNo || typeof jobNo !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "工番が不正です",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "インポートするデータがありません",
        },
        { status: 400 },
      );
    }

    const db = getDb();
    const table = dataType === "cad" ? cwxData : tbomData;

    // Check for existing data with the same jobNo
    const existing = await db.select().from(table).where(eq(table.jobNo, jobNo)).limit(1);

    if (existing.length > 0) {
      throw new ConflictError(`工番 ${jobNo} のデータは既に存在します`, jobNo);
    }

    // Transform data to match database schema
    const dbRows = rows.map((row) => ({
      id: row.id,
      jobNo: row.jobNo,
      listType: row.listType,
      kid: row.kid,
      idCount: row.idCount,
      kikiNo: row.kikiNo,
      kikiBame: row.kikiBame,
      qtyOrd: row.qtyOrd,
      shortSpec: row.shortSpec,
      ...(dataType === "cad" && "cwxLinkedFlg" in row ? { cwxLinkedFlg: row.cwxLinkedFlg } : {}),
    }));

    // Batch insert
    await db.insert(table).values(dbRows);

    return NextResponse.json({
      success: true,
      insertedCount: rows.length,
      jobNo,
    });
  } catch (error) {
    console.error("Execute error:", error);

    if (error instanceof ConflictError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          conflictingJobNo: error.jobNo,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "データベースエラーが発生しました",
        message: error instanceof Error ? error.message : "予期しないエラー",
      },
      { status: 500 },
    );
  }
}

/**
 * Custom error for conflict detection
 */
class ConflictError extends Error {
  jobNo?: string;

  constructor(message: string, jobNo?: string) {
    super(message);
    this.name = "ConflictError";
    this.jobNo = jobNo;
  }
}
