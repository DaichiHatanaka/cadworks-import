import { describe, it, expect, beforeEach, vi } from "vitest";
import type { NextRequest } from "next/server";
import { GET } from "./route";
import { getDb } from "@/db";

// DB モックを設定
vi.mock("@/db", () => ({
  getDb: vi.fn(),
}));

// 自動紐付けロジックのモック
vi.mock("@/lib/matching", () => ({
  executeAutoLink: vi.fn(),
}));

describe("GET /api/matching/init", () => {
  const mockCwxData = [
    {
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
  ];

  const mockTbomData = [
    {
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
  ];

  const mockLinkResults = [
    {
      id: "link-1",
      jobNo: "JOB001",
      cadId: "cad-1",
      tbomId: "tbom-1",
      status: "saved",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("工番に基づくデータを取得して初期化レスポンスを返す", async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };

    (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

    mockDb.where
      .mockResolvedValueOnce(mockCwxData) // cwxData
      .mockResolvedValueOnce(mockTbomData) // tbomData
      .mockResolvedValueOnce(mockLinkResults); // linkResults

    const { executeAutoLink } = await import("@/lib/matching");
    // 既存の紐付け結果があるため、未紐付けデータは空になり、自動紐付けは実行されない
    (executeAutoLink as ReturnType<typeof vi.fn>).mockReturnValue({
      linkedPairs: [],
      unlinkedCad: [],
      unlinkedTbom: [],
    });

    const request = new Request(
      "http://localhost:3000/api/matching/init?jobNo=JOB001&caseNo=CASE01&constructionType=NEW&listTypes=PUMP",
    );

    const response = await GET(request as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.header.jobNo).toBe("JOB001");
    expect(data.header.caseNo).toBe("CASE01");
    expect(data.header.constructionType).toBe("NEW");
    expect(data.stats.totalCadCount).toBe(1);
    expect(data.stats.linkedCount).toBe(1);
  });

  it("必須パラメータが不足している場合は 400 エラーを返す", async () => {
    const request = new Request("http://localhost:3000/api/matching/init");

    const response = await GET(request as NextRequest);

    expect(response.status).toBe(400);
  });

  it("該当データが見つからない場合は 404 エラーを返す", async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };

    (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

    const request = new Request(
      "http://localhost:3000/api/matching/init?jobNo=NOTFOUND&caseNo=CASE01&constructionType=NEW&listTypes=PUMP",
    );

    const response = await GET(request as NextRequest);

    expect(response.status).toBe(404);
  });
});
