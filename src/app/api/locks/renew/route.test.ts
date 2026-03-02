import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";
import { getDb } from "@/db";

// DB モックを設定
vi.mock("@/db", () => ({
  getDb: vi.fn(),
}));

describe("POST /api/locks/renew", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ロックトークンが一致する場合はロックを更新して 200 を返す", async () => {
    const mockDb = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue({ rowCount: 1 }),
    };

    (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

    const requestBody = {
      jobNo: "JOB001",
      lockToken: "valid-token",
    };

    const request = new Request("http://localhost:3000/api/locks/renew", {
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

  it("ロックトークンが不一致の場合は 409 エラーを返す", async () => {
    const mockDb = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue({ rowCount: 0 }),
    };

    (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

    const requestBody = {
      jobNo: "JOB001",
      lockToken: "invalid-token",
    };

    const request = new Request("http://localhost:3000/api/locks/renew", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(409);
  });

  it("必須パラメータが不足している場合は 400 エラーを返す", async () => {
    const request = new Request("http://localhost:3000/api/locks/renew", {
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
