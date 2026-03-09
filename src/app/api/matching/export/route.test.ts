import { describe, it, expect, beforeEach, vi } from "vitest";
import type { NextRequest } from "next/server";
import { GET } from "./route";
import { getDb } from "@/db";

// DB モックを設定
vi.mock("@/db", () => ({
  getDb: vi.fn(),
}));

describe("GET /api/matching/export", () => {
  const mockLinkedData = [
    {
      id: "link-1",
      jobNo: "JOB001",
      cadId: "cad-1",
      tbomId: "tbom-1",
      status: "saved",
      cad: {
        id: "cad-1",
        jobNo: "JOB001",
        listType: "PUMP",
        kid: "P001",
        idCount: "12345",
        kikiNo: "PUMP-001",
        kikiBame: "Pump A",
        qtyOrd: "1",
        shortSpec: "Spec A",
        cwxLinkedFlg: null,
      },
      tbom: {
        id: "tbom-1",
        jobNo: "JOB001",
        listType: "PUMP",
        kid: "P001",
        idCount: "12345",
        kikiNo: "PUMP-001",
        kikiBame: "Pump A",
        qtyOrd: "1",
        shortSpec: "Spec A",
      },
    },
    {
      id: "link-2",
      jobNo: "JOB001",
      cadId: "cad-2",
      tbomId: null,
      status: "unsaved",
      cad: {
        id: "cad-2",
        jobNo: "JOB001",
        listType: "PUMP",
        kid: "P002",
        idCount: "67890",
        kikiNo: "PUMP-002",
        kikiBame: "Pump B",
        qtyOrd: "2",
        shortSpec: "Spec B",
        cwxLinkedFlg: null,
      },
      tbom: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("工番に基づく紐付け結果を Excel ファイルとしてエクスポートする", async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      eq: vi.fn(),
    };

    (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

    // 複雑なクエリのモック（linkResults + cwxData + tbomData の JOIN）
    mockDb.where.mockResolvedValue(mockLinkedData);

    const request = new Request("http://localhost:3000/api/matching/export?jobNo=JOB001");

    const response = await GET(request as NextRequest);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    expect(response.headers.get("Content-Disposition")).toContain("attachment");
    expect(response.headers.get("Content-Disposition")).toContain("matching-result-JOB001.xlsx");

    // レスポンスボディが存在することを確認（実際の Excel ファイル内容の検証は省略）
    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });

  it("必須パラメータが不足している場合は 400 エラーを返す", async () => {
    const request = new Request("http://localhost:3000/api/matching/export");

    const response = await GET(request as NextRequest);

    expect(response.status).toBe(400);
  });

  it("該当データが見つからない場合は 404 エラーを返す", async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
    };

    (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

    mockDb.where.mockResolvedValue([]);

    const request = new Request("http://localhost:3000/api/matching/export?jobNo=NOTFOUND");

    const response = await GET(request as NextRequest);

    expect(response.status).toBe(404);
  });
});
