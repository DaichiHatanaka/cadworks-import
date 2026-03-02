import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { tagDefinitions } from "@/db/schema";

const getSchema = z.object({
  jobNo: z.string().min(1, "工番は必須です"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validation = getSchema.safeParse({
      jobNo: searchParams.get("jobNo"),
    });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.errors },
        { status: 400 },
      );
    }

    const { jobNo } = validation.data;
    const db = getDb();

    const definitions = await db
      .select()
      .from(tagDefinitions)
      .where(eq(tagDefinitions.jobNo, jobNo));

    return NextResponse.json(definitions);
  } catch (error) {
    console.error("Tags GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
