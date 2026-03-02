import { describe, it, expect } from "vitest";
import { getTableColumns } from "drizzle-orm";
import { cwxData, tbomData, linkResults, jobLocks } from "./schema";

describe("cwx_data テーブル", () => {
  it("必要なカラムがすべて定義されている", () => {
    const columns = getTableColumns(cwxData);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("jobNo");
    expect(columnNames).toContain("listType");
    expect(columnNames).toContain("kid");
    expect(columnNames).toContain("idCount");
    expect(columnNames).toContain("kikiNo");
    expect(columnNames).toContain("kikiBame");
    expect(columnNames).toContain("qtyOrd");
    expect(columnNames).toContain("shortSpec");
    expect(columnNames).toContain("cwxLinkedFlg");
  });

  it("id が主キーである", () => {
    const columns = getTableColumns(cwxData);
    expect(columns.id.primary).toBe(true);
  });

  it("必須カラムに notNull 制約がある", () => {
    const columns = getTableColumns(cwxData);
    expect(columns.jobNo.notNull).toBe(true);
    expect(columns.listType.notNull).toBe(true);
    expect(columns.kid.notNull).toBe(true);
    expect(columns.idCount.notNull).toBe(true);
    expect(columns.kikiNo.notNull).toBe(true);
    expect(columns.kikiBame.notNull).toBe(true);
    expect(columns.qtyOrd.notNull).toBe(true);
  });

  it("nullable カラムが正しく定義されている", () => {
    const columns = getTableColumns(cwxData);
    expect(columns.shortSpec.notNull).toBe(false);
    expect(columns.cwxLinkedFlg.notNull).toBe(false);
  });
});

describe("tbom_data テーブル", () => {
  it("必要なカラムがすべて定義されている", () => {
    const columns = getTableColumns(tbomData);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("jobNo");
    expect(columnNames).toContain("listType");
    expect(columnNames).toContain("kid");
    expect(columnNames).toContain("idCount");
    expect(columnNames).toContain("kikiNo");
    expect(columnNames).toContain("kikiBame");
    expect(columnNames).toContain("qtyOrd");
    expect(columnNames).toContain("shortSpec");
  });

  it("id が主キーである", () => {
    const columns = getTableColumns(tbomData);
    expect(columns.id.primary).toBe(true);
  });

  it("必須カラムに notNull 制約がある", () => {
    const columns = getTableColumns(tbomData);
    expect(columns.jobNo.notNull).toBe(true);
    expect(columns.listType.notNull).toBe(true);
    expect(columns.kid.notNull).toBe(true);
    expect(columns.idCount.notNull).toBe(true);
    expect(columns.kikiNo.notNull).toBe(true);
    expect(columns.kikiBame.notNull).toBe(true);
    expect(columns.qtyOrd.notNull).toBe(true);
  });

  it("shortSpec は nullable である", () => {
    const columns = getTableColumns(tbomData);
    expect(columns.shortSpec.notNull).toBe(false);
  });
});

describe("link_results テーブル", () => {
  it("必要なカラムがすべて定義されている", () => {
    const columns = getTableColumns(linkResults);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("jobNo");
    expect(columnNames).toContain("cadId");
    expect(columnNames).toContain("tbomId");
    expect(columnNames).toContain("status");
    expect(columnNames).toContain("createdAt");
    expect(columnNames).toContain("updatedAt");
  });

  it("id が主キーである", () => {
    const columns = getTableColumns(linkResults);
    expect(columns.id.primary).toBe(true);
  });

  it("tbomId は nullable である", () => {
    const columns = getTableColumns(linkResults);
    expect(columns.tbomId.notNull).toBe(false);
  });

  it("cadId は必須である", () => {
    const columns = getTableColumns(linkResults);
    expect(columns.cadId.notNull).toBe(true);
  });

  it("status は必須である", () => {
    const columns = getTableColumns(linkResults);
    expect(columns.status.notNull).toBe(true);
  });
});

describe("job_locks テーブル", () => {
  it("必要なカラムがすべて定義されている", () => {
    const columns = getTableColumns(jobLocks);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("jobNo");
    expect(columnNames).toContain("lockedByUserId");
    expect(columnNames).toContain("lockedByUserName");
    expect(columnNames).toContain("lockedAt");
    expect(columnNames).toContain("expiresAt");
    expect(columnNames).toContain("lockToken");
  });

  it("jobNo が主キーである", () => {
    const columns = getTableColumns(jobLocks);
    expect(columns.jobNo.primary).toBe(true);
  });

  it("すべてのカラムが必須である", () => {
    const columns = getTableColumns(jobLocks);
    expect(columns.lockedByUserId.notNull).toBe(true);
    expect(columns.lockedByUserName.notNull).toBe(true);
    expect(columns.lockedAt.notNull).toBe(true);
    expect(columns.expiresAt.notNull).toBe(true);
    expect(columns.lockToken.notNull).toBe(true);
  });
});
