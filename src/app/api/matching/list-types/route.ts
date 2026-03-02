import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { listTypeMaster } from "@/db/schema";

export async function GET() {
  try {
    const db = getDb();
    const results = await db
      .select({
        listType: listTypeMaster.listType,
        listName: listTypeMaster.listName,
      })
      .from(listTypeMaster);

    return NextResponse.json(results);
  } catch (error) {
    console.error("List types GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
