import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "./route";
import { getDb } from "@/db";

// DB モックを設定
vi.mock("@/db", () => ({
  getDb: vi.fn(),
}));

describe("GET /api/locks/status/[jobNo]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ロックが存在する場合はロック情報を返す", async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          lockedByUserName: "Test User",
          lockedAt: new Date("2024-01-01T00:00:00Z"),
        },
      ]),
    };

    (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

    const request = new Request("http://localhost:3000/api/locks/status/JOB001");
    const response = await GET(request, { params: Promise.resolve({ jobNo: "JOB001" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.locked).toBe(true);
    expect(data.lockedBy).toBe("Test User");
    expect(data.lockedAt).toBeDefined();
  });

  it("ロックが存在しない場合は未ロック状態を返す", async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };

    (getDb as ReturnType<typeof vi.fn>).mockReturnValue(mockDb);

    const request = new Request("http://localhost:3000/api/locks/status/JOB002");
    const response = await GET(request, { params: Promise.resolve({ jobNo: "JOB002" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.locked).toBe(false);
  });
});
