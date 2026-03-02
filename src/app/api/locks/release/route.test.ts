import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";
import { getDb } from "@/db";

// DB モックを設定
vi.mock("@/db", () => ({
  getDb: vi.fn(),
}));

describe("POST /api/locks/release", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ロックトークンが一致する場合はロックを解放して 200 を返す", async () => {
    const mockDb = {
      delete: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ jobNo: "JOB001" }]),
      and: vi.fn(),
      eq: vi.fn(),
    };

    (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

    const requestBody = {
      jobNo: "JOB001",
      lockToken: "valid-token",
    };

    const request = new Request("http://localhost:3000/api/locks/release", {
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

  it("ロックトークンが不一致でもエラーを返さず成功とする（冪等性）", async () => {
    const mockDb = {
      delete: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
      and: vi.fn(),
      eq: vi.fn(),
    };

    (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

    const requestBody = {
      jobNo: "JOB001",
      lockToken: "invalid-token",
    };

    const request = new Request("http://localhost:3000/api/locks/release", {
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

  it("必須パラメータが不足している場合は 400 エラーを返す", async () => {
    const request = new Request("http://localhost:3000/api/locks/release", {
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
