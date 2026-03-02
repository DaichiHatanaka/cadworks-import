import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { costItemFolders } from "@/db/schema";

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

    const folders = await db.select().from(costItemFolders).where(eq(costItemFolders.jobNo, jobNo));

    return NextResponse.json(folders);
  } catch (error) {
    console.error("Folders GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createSchema = z.object({
  jobNo: z.string().min(1),
  name: z.string().min(1),
  parentId: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.errors },
        { status: 400 },
      );
    }

    const data = validation.data;
    const db = getDb();

    const id = `folder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await db.insert(costItemFolders).values({
      id,
      jobNo: data.jobNo,
      name: data.name,
      parentId: data.parentId ?? null,
      sortOrder: 0,
    });

    const [created] = await db.select().from(costItemFolders).where(eq(costItemFolders.id, id));

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Folders POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
