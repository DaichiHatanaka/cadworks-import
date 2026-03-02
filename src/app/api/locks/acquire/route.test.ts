import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";
import { getDb } from "@/db";

// DB モックを設定
vi.mock("@/db", () => ({
  getDb: vi.fn(),
}));

describe("POST /api/locks/acquire", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ロック取得に成功した場合は 200 を返す", async () => {
    const mockDb = {
      delete: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]), // 既存ロックなし
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue(undefined),
    };

    (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

    const requestBody = {
      jobNo: "JOB001",
      userId: "user-1",
      userName: "Test User",
      lockToken: "test-token-123",
    };

    const request = new Request("http://localhost:3000/api/locks/acquire", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("ロックが既に取得されている場合は 409 エラーを返す", async () => {
    const futureDate = new Date(Date.now() + 60000); // 未来の有効期限
    const mockDb = {
      delete: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          jobNo: "JOB001",
          lockedByUserId: "user-1",
          lockedByUserName: "Other User",
          lockedAt: new Date(),
          expiresAt: futureDate,
          lockToken: "existing-token",
        },
      ]),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue(undefined),
    };

    (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

    const requestBody = {
      jobNo: "JOB001",
      userId: "user-2",
      userName: "Test User 2",
      lockToken: "test-token-456",
    };

    const request = new Request("http://localhost:3000/api/locks/acquire", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.lockedBy).toBe("Other User");
  });

  it("必須パラメータが不足している場合は 400 エラーを返す", async () => {
    const request = new Request("http://localhost:3000/api/locks/acquire", {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
