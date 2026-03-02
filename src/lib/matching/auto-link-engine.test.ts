import { describe, it, expect } from "vitest";
import { executeAutoLink } from "./auto-link-engine";
import type { CwxRecord, TbomRecord } from "./types";

// --- ヘルパー ---

function makeCad(overrides: Partial<CwxRecord> = {}): CwxRecord {
  return {
    id: "cad-1",
    jobNo: "J001",
    listType: "LT-A",
    kid: "K001",
    idCount: "1234567890",
    kikiNo: "KIKI-001",
    kikiBame: "ポンプ A",
    qtyOrd: "1",
    shortSpec: "100L/min",
    cwxLinkedFlg: null,
    ...overrides,
  };
}

function makeTbom(overrides: Partial<TbomRecord> = {}): TbomRecord {
  return {
    id: "tbom-1",
    jobNo: "J001",
    listType: "LT-A",
    kid: "K001",
    idCount: "1234567890",
    kikiNo: "ポンプ A",
    kikiBame: "ポンプ A",
    qtyOrd: "1",
    shortSpec: "100L/min",
    ...overrides,
  };
}

// --- テスト ---

describe("executeAutoLink", () => {
  describe("ID_COUNT 完全一致パターン", () => {
    it("LIST_TYPE・KID・ID_COUNT がすべて一致する場合、saved ステータスでペアを生成する", () => {
      const cad = makeCad({ idCount: "1234567890" });
      const tbom = makeTbom({ idCount: "1234567890" });

      const result = executeAutoLink([cad], [tbom]);

      expect(result.linkedPairs).toHaveLength(1);
      expect(result.linkedPairs[0].cad).toBe(cad);
      expect(result.linkedPairs[0].tbom).toBe(tbom);
      expect(result.linkedPairs[0].status).toBe("saved");
      expect(result.unlinkedCad).toHaveLength(0);
      expect(result.unlinkedTbom).toHaveLength(0);
    });
  });

  describe("ID_COUNT 下5桁一致パターン", () => {
    it("LIST_TYPE・KID が一致し ID_COUNT の下5桁のみ一致する場合、unsaved ステータスでペアを生成する", () => {
      const cad = makeCad({ idCount: "9999967890" });
      const tbom = makeTbom({ idCount: "0000067890" });

      const result = executeAutoLink([cad], [tbom]);

      expect(result.linkedPairs).toHaveLength(1);
      expect(result.linkedPairs[0].cad).toBe(cad);
      expect(result.linkedPairs[0].tbom).toBe(tbom);
      expect(result.linkedPairs[0].status).toBe("unsaved");
      expect(result.unlinkedCad).toHaveLength(0);
      expect(result.unlinkedTbom).toHaveLength(0);
    });

    it("完全一致の方が下5桁一致より優先される", () => {
      const cad = makeCad({ idCount: "1234567890" });
      const tbomExact = makeTbom({ id: "tbom-exact", idCount: "1234567890" });
      const tbomPartial = makeTbom({
        id: "tbom-partial",
        idCount: "9999967890",
      });

      const result = executeAutoLink([cad], [tbomExact, tbomPartial]);

      expect(result.linkedPairs).toHaveLength(1);
      expect(result.linkedPairs[0].tbom).toBe(tbomExact);
      expect(result.linkedPairs[0].status).toBe("saved");
      expect(result.unlinkedTbom).toHaveLength(1);
      expect(result.unlinkedTbom[0]).toBe(tbomPartial);
    });
  });

  describe("LIST_TYPE / KID 不一致パターン", () => {
    it("LIST_TYPE が異なる場合、両方とも未紐付けとして残る", () => {
      const cad = makeCad({ listType: "LT-A" });
      const tbom = makeTbom({ listType: "LT-B" });

      const result = executeAutoLink([cad], [tbom]);

      expect(result.linkedPairs).toHaveLength(0);
      expect(result.unlinkedCad).toHaveLength(1);
      expect(result.unlinkedCad[0]).toBe(cad);
      expect(result.unlinkedTbom).toHaveLength(1);
      expect(result.unlinkedTbom[0]).toBe(tbom);
    });

    it("KID が異なる場合、両方とも未紐付けとして残る", () => {
      const cad = makeCad({ kid: "K001" });
      const tbom = makeTbom({ kid: "K999" });

      const result = executeAutoLink([cad], [tbom]);

      expect(result.linkedPairs).toHaveLength(0);
      expect(result.unlinkedCad).toHaveLength(1);
      expect(result.unlinkedTbom).toHaveLength(1);
    });
  });

  describe("CAD に対応する T-BOM が存在しないパターン", () => {
    it("T-BOM が空配列の場合、全 CAD が未紐付けとなる", () => {
      const cad1 = makeCad({ id: "cad-1" });
      const cad2 = makeCad({ id: "cad-2", kid: "K002" });

      const result = executeAutoLink([cad1, cad2], []);

      expect(result.linkedPairs).toHaveLength(0);
      expect(result.unlinkedCad).toHaveLength(2);
      expect(result.unlinkedTbom).toHaveLength(0);
    });

    it("KID が一致する T-BOM が存在しない CAD は未紐付けとなる", () => {
      const cad = makeCad({ kid: "K001" });
      const tbom = makeTbom({ kid: "K999" });

      const result = executeAutoLink([cad], [tbom]);

      expect(result.unlinkedCad).toContain(cad);
    });
  });

  describe("T-BOM に対応する CAD が存在しないパターン", () => {
    it("CAD が空配列の場合、全 T-BOM が未紐付けとなる", () => {
      const tbom1 = makeTbom({ id: "tbom-1" });
      const tbom2 = makeTbom({ id: "tbom-2", kid: "K002" });

      const result = executeAutoLink([], [tbom1, tbom2]);

      expect(result.linkedPairs).toHaveLength(0);
      expect(result.unlinkedCad).toHaveLength(0);
      expect(result.unlinkedTbom).toHaveLength(2);
    });
  });

  describe("複数 LIST_TYPE が混在するデータセット", () => {
    it("異なる LIST_TYPE のデータが正しく振り分けられる", () => {
      const cadA = makeCad({
        id: "cad-a",
        listType: "LT-A",
        kid: "K001",
        idCount: "1234567890",
      });
      const cadB = makeCad({
        id: "cad-b",
        listType: "LT-B",
        kid: "K002",
        idCount: "0000012345",
      });
      const cadC = makeCad({
        id: "cad-c",
        listType: "LT-A",
        kid: "K003",
        idCount: "9999900000",
      });

      const tbomA = makeTbom({
        id: "tbom-a",
        listType: "LT-A",
        kid: "K001",
        idCount: "1234567890",
      });
      const tbomB = makeTbom({
        id: "tbom-b",
        listType: "LT-B",
        kid: "K002",
        idCount: "9999912345",
      });
      const tbomD = makeTbom({
        id: "tbom-d",
        listType: "LT-C",
        kid: "K004",
        idCount: "1111111111",
      });

      const result = executeAutoLink([cadA, cadB, cadC], [tbomA, tbomB, tbomD]);

      // cadA + tbomA: LIST_TYPE=LT-A, KID=K001, ID_COUNT完全一致 → saved
      const pairA = result.linkedPairs.find((p) => p.cad.id === "cad-a");
      expect(pairA).toBeDefined();
      expect(pairA!.tbom!.id).toBe("tbom-a");
      expect(pairA!.status).toBe("saved");

      // cadB + tbomB: LIST_TYPE=LT-B, KID=K002, ID_COUNT下5桁一致(12345) → unsaved
      const pairB = result.linkedPairs.find((p) => p.cad.id === "cad-b");
      expect(pairB).toBeDefined();
      expect(pairB!.tbom!.id).toBe("tbom-b");
      expect(pairB!.status).toBe("unsaved");

      // cadC: LIST_TYPE=LT-A, KID=K003 → 対応 T-BOM なし → 未紐付け
      expect(result.unlinkedCad).toHaveLength(1);
      expect(result.unlinkedCad[0].id).toBe("cad-c");

      // tbomD: LIST_TYPE=LT-C → 対応 CAD なし → 未紐付け
      expect(result.unlinkedTbom).toHaveLength(1);
      expect(result.unlinkedTbom[0].id).toBe("tbom-d");
    });

    it("同一 LIST_TYPE 内で複数ペアが正しくマッチングされる", () => {
      const cad1 = makeCad({
        id: "cad-1",
        listType: "LT-A",
        kid: "K001",
        idCount: "1111111111",
      });
      const cad2 = makeCad({
        id: "cad-2",
        listType: "LT-A",
        kid: "K002",
        idCount: "2222222222",
      });

      const tbom1 = makeTbom({
        id: "tbom-1",
        listType: "LT-A",
        kid: "K001",
        idCount: "1111111111",
      });
      const tbom2 = makeTbom({
        id: "tbom-2",
        listType: "LT-A",
        kid: "K002",
        idCount: "2222222222",
      });

      const result = executeAutoLink([cad1, cad2], [tbom1, tbom2]);

      expect(result.linkedPairs).toHaveLength(2);
      expect(result.unlinkedCad).toHaveLength(0);
      expect(result.unlinkedTbom).toHaveLength(0);

      const pair1 = result.linkedPairs.find((p) => p.cad.id === "cad-1");
      expect(pair1!.tbom!.id).toBe("tbom-1");
      expect(pair1!.status).toBe("saved");

      const pair2 = result.linkedPairs.find((p) => p.cad.id === "cad-2");
      expect(pair2!.tbom!.id).toBe("tbom-2");
      expect(pair2!.status).toBe("saved");
    });
  });

  describe("エッジケース", () => {
    it("両方空配列の場合、空の結果を返す", () => {
      const result = executeAutoLink([], []);

      expect(result.linkedPairs).toHaveLength(0);
      expect(result.unlinkedCad).toHaveLength(0);
      expect(result.unlinkedTbom).toHaveLength(0);
    });

    it("ID_COUNT が5桁未満の場合でも下5桁一致ロジックが正しく動作する", () => {
      const cad = makeCad({ idCount: "123" });
      const tbom = makeTbom({ idCount: "00123" });

      const result = executeAutoLink([cad], [tbom]);

      // "123" の下5桁は "00123"、"00123" の下5桁も "00123" → 一致
      expect(result.linkedPairs).toHaveLength(1);
      expect(result.linkedPairs[0].status).toBe("unsaved");
    });

    it("各ペアに一意の id が生成される", () => {
      const cad1 = makeCad({
        id: "cad-1",
        kid: "K001",
        idCount: "1111111111",
      });
      const cad2 = makeCad({
        id: "cad-2",
        kid: "K002",
        idCount: "2222222222",
      });
      const tbom1 = makeTbom({
        id: "tbom-1",
        kid: "K001",
        idCount: "1111111111",
      });
      const tbom2 = makeTbom({
        id: "tbom-2",
        kid: "K002",
        idCount: "2222222222",
      });

      const result = executeAutoLink([cad1, cad2], [tbom1, tbom2]);

      const ids = result.linkedPairs.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("同一 KID で複数の T-BOM が存在する場合、完全一致が優先される", () => {
      const cad = makeCad({ kid: "K001", idCount: "1234567890" });
      const tbomPartial = makeTbom({
        id: "tbom-partial",
        kid: "K001",
        idCount: "0000067890",
      });
      const tbomExact = makeTbom({
        id: "tbom-exact",
        kid: "K001",
        idCount: "1234567890",
      });

      // tbomPartial が先に来ても完全一致が優先される
      const result = executeAutoLink([cad], [tbomPartial, tbomExact]);

      expect(result.linkedPairs).toHaveLength(1);
      expect(result.linkedPairs[0].tbom!.id).toBe("tbom-exact");
      expect(result.linkedPairs[0].status).toBe("saved");
      expect(result.unlinkedTbom).toHaveLength(1);
      expect(result.unlinkedTbom[0].id).toBe("tbom-partial");
    });

    it("ID_COUNT の下5桁が不一致の場合、ペアにならない", () => {
      const cad = makeCad({ idCount: "1234500000" });
      const tbom = makeTbom({ idCount: "1234599999" });

      const result = executeAutoLink([cad], [tbom]);

      expect(result.linkedPairs).toHaveLength(0);
      expect(result.unlinkedCad).toHaveLength(1);
      expect(result.unlinkedTbom).toHaveLength(1);
    });
  });
});
