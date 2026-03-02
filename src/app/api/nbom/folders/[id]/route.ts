import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { costItemFolders } from "@/db/schema";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = patchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.errors },
        { status: 400 },
      );
    }

    const db = getDb();

    const [existing] = await db.select().from(costItemFolders).where(eq(costItemFolders.id, id));

    if (!existing) {
      return NextResponse.json({ error: "フォルダが見つかりません" }, { status: 404 });
    }

    await db.update(costItemFolders).set(validation.data).where(eq(costItemFolders.id, id));

    const [updated] = await db.select().from(costItemFolders).where(eq(costItemFolders.id, id));

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Folder PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = getDb();

    const [existing] = await db.select().from(costItemFolders).where(eq(costItemFolders.id, id));

    if (!existing) {
      return NextResponse.json({ error: "フォルダが見つかりません" }, { status: 404 });
    }

    await db.delete(costItemFolders).where(eq(costItemFolders.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Folder DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
