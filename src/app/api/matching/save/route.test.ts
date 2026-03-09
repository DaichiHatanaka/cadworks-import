import { describe, it, expect, beforeEach, vi } from "vitest";
import type { NextRequest } from "next/server";
import { POST } from "./route";
import { getDb } from "@/db";

// DB モックを設定
vi.mock("@/db", () => ({
  getDb: vi.fn(),
}));

describe("POST /api/matching/save", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("未保存の紐付け結果を DB に反映し、保存件数を返す", async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([
        {
          jobNo: "JOB001",
          lockToken: "valid-token",
        },
      ]),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
    };

    (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

    const requestBody = {
      jobNo: "JOB001",
      lockToken: "valid-token",
      pairs: [
        {
          cadId: "cad-1",
          tbomId: "tbom-1",
          status: "unsaved" as const,
        },
        {
          cadId: "cad-2",
          tbomId: null,
          status: "unsaved" as const,
        },
      ],
    };

    const request = new Request("http://localhost:3000/api/matching/save", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.savedCount).toBe(2);
  });

  it("ロックトークンが不正な場合は 409 エラーを返す", async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };

    (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

    const requestBody = {
      jobNo: "JOB001",
      lockToken: "invalid-token",
      pairs: [],
    };

    const request = new Request("http://localhost:3000/api/matching/save", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request as NextRequest);

    expect(response.status).toBe(409);
  });

  it("必須パラメータが不足している場合は 400 エラーを返す", async () => {
    const request = new Request("http://localhost:3000/api/matching/save", {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request as NextRequest);

    expect(response.status).toBe(400);
  });
});
