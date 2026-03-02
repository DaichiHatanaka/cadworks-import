import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useMatchingState } from "./use-matching-state";
import type { CwxRecord, TbomRecord } from "./types";

describe("useMatchingState", () => {
  const mockCadRecords: CwxRecord[] = [
    {
      id: "cad-1",
      jobNo: "J001",
      listType: "PUMP",
      kid: "K001",
      idCount: "00001",
      kikiNo: "P-001",
      kikiBame: "Pump A",
      qtyOrd: "1",
      shortSpec: "Spec A",
      cwxLinkedFlg: null,
    },
    {
      id: "cad-2",
      jobNo: "J001",
      listType: "VALVE",
      kid: "K002",
      idCount: "00002",
      kikiNo: "V-001",
      kikiBame: "Valve B",
      qtyOrd: "2",
      shortSpec: "Spec B",
      cwxLinkedFlg: null,
    },
  ];

  const mockTbomRecords: TbomRecord[] = [
    {
      id: "tbom-1",
      jobNo: "J001",
      listType: "PUMP",
      kid: "K001",
      idCount: "00001",
      kikiNo: "P-001",
      kikiBame: "Pump A",
      qtyOrd: "1",
      shortSpec: "Spec A",
    },
    {
      id: "tbom-2",
      jobNo: "J001",
      listType: "VALVE",
      kid: "K002",
      idCount: "00002",
      kikiNo: "V-001-Mod",
      kikiBame: "Valve B Modified",
      qtyOrd: "2",
      shortSpec: "Spec B",
    },
  ];

  describe("初期化", () => {
    it("初期状態で未紐付けデータと紐付け済みデータを正しく保持する", () => {
      const { result } = renderHook(() =>
        useMatchingState({
          unlinkedCad: mockCadRecords,
          unlinkedTbom: mockTbomRecords,
          linkedPairs: [],
          totalCadCount: mockCadRecords.length,
        }),
      );

      expect(result.current.state.unlinkedCad).toHaveLength(2);
      expect(result.current.state.unlinkedTbom).toHaveLength(2);
      expect(result.current.state.linkedPairs).toHaveLength(0);
      expect(result.current.state.totalCadCount).toBe(2);
      expect(result.current.state.progressPercent).toBe(0);
    });
  });

  describe("紐付け操作", () => {
    it("CAD行とT-BOM行を選択して紐付けボタンを押下すると、ペアが下段に追加され上段から削除される", () => {
      const { result } = renderHook(() =>
        useMatchingState({
          unlinkedCad: mockCadRecords,
          unlinkedTbom: mockTbomRecords,
          linkedPairs: [],
          totalCadCount: mockCadRecords.length,
        }),
      );

      // CAD行とT-BOM行を選択
      act(() => {
        result.current.actions.selectCadRow(mockCadRecords[0]);
        result.current.actions.selectTbomRow(mockTbomRecords[0]);
      });

      // 紐付け実行
      act(() => {
        const linkResult = result.current.actions.linkPair(mockCadRecords[0]!, mockTbomRecords[0]!);
        expect(linkResult.success).toBe(true);
      });

      // 検証
      expect(result.current.state.linkedPairs).toHaveLength(1);
      expect(result.current.state.linkedPairs[0]?.cad.id).toBe("cad-1");
      expect(result.current.state.linkedPairs[0]?.tbom?.id).toBe("tbom-1");
      expect(result.current.state.linkedPairs[0]?.status).toBe("unsaved");

      expect(result.current.state.unlinkedCad).toHaveLength(1);
      expect(result.current.state.unlinkedTbom).toHaveLength(1);

      // 進捗率が更新される
      expect(result.current.state.progressPercent).toBe(50); // 1/2 = 50%
    });

    it("LIST_TYPE が不一致の場合、紐付けが失敗し警告が返される", () => {
      const { result } = renderHook(() =>
        useMatchingState({
          unlinkedCad: mockCadRecords,
          unlinkedTbom: mockTbomRecords,
          linkedPairs: [],
          totalCadCount: mockCadRecords.length,
        }),
      );

      // 異なるLIST_TYPEの行を選択して紐付け試行
      act(() => {
        const linkResult = result.current.actions.linkPair(
          mockCadRecords[0]!, // PUMP
          mockTbomRecords[1]!, // VALVE
        );
        expect(linkResult.success).toBe(false);
        expect(linkResult.reason).toBe("list_type_mismatch");
      });

      // 状態が変更されていないことを確認
      expect(result.current.state.linkedPairs).toHaveLength(0);
      expect(result.current.state.unlinkedCad).toHaveLength(2);
      expect(result.current.state.unlinkedTbom).toHaveLength(2);
    });
  });

  describe("追加操作（T-BOM対応なし）", () => {
    it("CAD行をT-BOM対応なしで下段に追加する", () => {
      const { result } = renderHook(() =>
        useMatchingState({
          unlinkedCad: mockCadRecords,
          unlinkedTbom: mockTbomRecords,
          linkedPairs: [],
          totalCadCount: mockCadRecords.length,
        }),
      );

      act(() => {
        result.current.actions.addWithoutTbom(mockCadRecords[0]!);
      });

      expect(result.current.state.linkedPairs).toHaveLength(1);
      expect(result.current.state.linkedPairs[0]?.cad.id).toBe("cad-1");
      expect(result.current.state.linkedPairs[0]?.tbom).toBeNull();
      expect(result.current.state.linkedPairs[0]?.status).toBe("unsaved");

      expect(result.current.state.unlinkedCad).toHaveLength(1);
      expect(result.current.state.unlinkedTbom).toHaveLength(2); // T-BOMは削除されない

      // 進捗率が更新される
      expect(result.current.state.progressPercent).toBe(50);
    });
  });

  describe("紐付け解除操作", () => {
    it("下段のペアを解除し、CADを上段左、T-BOMを上段右に復元する", () => {
      const { result } = renderHook(() =>
        useMatchingState({
          unlinkedCad: [mockCadRecords[1]!], // cad-2のみ未紐付け
          unlinkedTbom: [mockTbomRecords[1]!], // tbom-2のみ未紐付け
          linkedPairs: [
            {
              id: "link-1",
              cad: mockCadRecords[0]!,
              tbom: mockTbomRecords[0]!,
              status: "unsaved",
            },
          ],
          totalCadCount: mockCadRecords.length,
        }),
      );

      expect(result.current.state.linkedPairs).toHaveLength(1);

      act(() => {
        result.current.actions.unlinkPair(result.current.state.linkedPairs[0]!);
      });

      expect(result.current.state.linkedPairs).toHaveLength(0);
      expect(result.current.state.unlinkedCad).toHaveLength(2);
      expect(result.current.state.unlinkedTbom).toHaveLength(2);

      // 進捗率が更新される
      expect(result.current.state.progressPercent).toBe(0);
    });

    it("T-BOM対応なしのペアを解除すると、CADのみが上段左に復元される", () => {
      const { result } = renderHook(() =>
        useMatchingState({
          unlinkedCad: [mockCadRecords[1]!],
          unlinkedTbom: mockTbomRecords,
          linkedPairs: [
            {
              id: "link-1",
              cad: mockCadRecords[0]!,
              tbom: null,
              status: "unsaved",
            },
          ],
          totalCadCount: mockCadRecords.length,
        }),
      );

      act(() => {
        result.current.actions.unlinkPair(result.current.state.linkedPairs[0]!);
      });

      expect(result.current.state.linkedPairs).toHaveLength(0);
      expect(result.current.state.unlinkedCad).toHaveLength(2);
      expect(result.current.state.unlinkedTbom).toHaveLength(2); // T-BOMは変化なし
    });
  });

  describe("連動フィルタ", () => {
    it("CAD行選択時に連動フィルタがONの場合、T-BOMが同一LIST_TYPEでフィルタされる", () => {
      const { result } = renderHook(() =>
        useMatchingState({
          unlinkedCad: mockCadRecords,
          unlinkedTbom: mockTbomRecords,
          linkedPairs: [],
          totalCadCount: mockCadRecords.length,
        }),
      );

      // 連動フィルタをONにする（デフォルトON）
      expect(result.current.state.isLinkedFilterEnabled).toBe(true);

      // PUMP（cad-1）を選択
      act(() => {
        result.current.actions.selectCadRow(mockCadRecords[0]!);
      });

      // 選択行が保持される
      expect(result.current.state.selectedCadRow?.id).toBe("cad-1");

      // フィルタ状態が更新される（実際のフィルタリングはコンポーネント層で実装）
      // このテストではフィルタ状態の更新のみを検証
      expect(result.current.state.cadListTypeFilter).toBe("PUMP");
    });

    it("連動フィルタをOFFにすると、CAD選択時にT-BOMフィルタが適用されない", () => {
      const { result } = renderHook(() =>
        useMatchingState({
          unlinkedCad: mockCadRecords,
          unlinkedTbom: mockTbomRecords,
          linkedPairs: [],
          totalCadCount: mockCadRecords.length,
        }),
      );

      // 連動フィルタをOFFにする
      act(() => {
        result.current.actions.toggleLinkedFilter(false);
      });

      expect(result.current.state.isLinkedFilterEnabled).toBe(false);

      // CAD行を選択
      act(() => {
        result.current.actions.selectCadRow(mockCadRecords[0]!);
      });

      // フィルタが適用されない
      expect(result.current.state.cadListTypeFilter).toBeNull();
    });
  });

  describe("フィルタ操作", () => {
    it("CAD側のリストタイプフィルタを設定できる", () => {
      const { result } = renderHook(() =>
        useMatchingState({
          unlinkedCad: mockCadRecords,
          unlinkedTbom: mockTbomRecords,
          linkedPairs: [],
          totalCadCount: mockCadRecords.length,
        }),
      );

      act(() => {
        result.current.actions.setCadListTypeFilter("PUMP");
      });

      expect(result.current.state.cadListTypeFilter).toBe("PUMP");
    });

    it("下段のリストタイプフィルタとステータスフィルタを設定できる", () => {
      const { result } = renderHook(() =>
        useMatchingState({
          unlinkedCad: mockCadRecords,
          unlinkedTbom: mockTbomRecords,
          linkedPairs: [],
          totalCadCount: mockCadRecords.length,
        }),
      );

      act(() => {
        result.current.actions.setLinkedListTypeFilter("VALVE");
        result.current.actions.setLinkedStatusFilter("unsaved");
        result.current.actions.setLinkedSearchText("P-001");
      });

      expect(result.current.state.linkedListTypeFilter).toBe("VALVE");
      expect(result.current.state.linkedStatusFilter).toBe("unsaved");
      expect(result.current.state.linkedSearchText).toBe("P-001");
    });
  });

  describe("破棄操作とスナップショット", () => {
    it("保存時にスナップショットが作成され、破棄時に復元される", () => {
      const { result } = renderHook(() =>
        useMatchingState({
          unlinkedCad: mockCadRecords,
          unlinkedTbom: mockTbomRecords,
          linkedPairs: [],
          totalCadCount: mockCadRecords.length,
        }),
      );

      // 紐付け実行（未保存状態）
      act(() => {
        result.current.actions.linkPair(mockCadRecords[0]!, mockTbomRecords[0]!);
      });

      expect(result.current.state.linkedPairs).toHaveLength(1);
      expect(result.current.state.hasUnsavedChanges).toBe(true);

      // 保存実行（スナップショット作成）
      act(() => {
        result.current.actions.markAsSaved();
      });

      expect(result.current.state.linkedPairs[0]?.status).toBe("saved");
      expect(result.current.state.hasUnsavedChanges).toBe(false);

      // さらに紐付けを追加（未保存状態）
      act(() => {
        result.current.actions.linkPair(mockCadRecords[1]!, mockTbomRecords[1]!);
      });

      expect(result.current.state.linkedPairs).toHaveLength(2);
      expect(result.current.state.hasUnsavedChanges).toBe(true);

      // 破棄実行（前回保存時点に復元）
      act(() => {
        result.current.actions.discardChanges();
      });

      expect(result.current.state.linkedPairs).toHaveLength(1);
      expect(result.current.state.hasUnsavedChanges).toBe(false);
      expect(result.current.state.unlinkedCad).toHaveLength(1); // cad-2が復元される
    });
  });

  describe("進捗率計算", () => {
    it("進捗率が正しく計算される", () => {
      const { result } = renderHook(() =>
        useMatchingState({
          unlinkedCad: mockCadRecords,
          unlinkedTbom: mockTbomRecords,
          linkedPairs: [],
          totalCadCount: mockCadRecords.length,
        }),
      );

      expect(result.current.state.progressPercent).toBe(0);

      // 1件紐付け
      act(() => {
        result.current.actions.linkPair(mockCadRecords[0]!, mockTbomRecords[0]!);
      });

      expect(result.current.state.progressPercent).toBe(50); // 1/2

      // 2件目紐付け
      act(() => {
        result.current.actions.linkPair(mockCadRecords[1]!, mockTbomRecords[1]!);
      });

      expect(result.current.state.progressPercent).toBe(100); // 2/2
    });
  });
});
