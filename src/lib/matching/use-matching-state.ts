"use client";

import { useState, useCallback, useMemo } from "react";
import type { CwxRecord, TbomRecord, LinkedPair } from "./types";

/** 紐付け操作の結果 */
export type LinkResult = { success: true } | { success: false; reason: "list_type_mismatch" };

/** 紐付け状態 */
export interface MatchingState {
  // データ
  unlinkedCad: CwxRecord[];
  unlinkedTbom: TbomRecord[];
  linkedPairs: LinkedPair[];

  // 選択
  selectedCadRow: CwxRecord | null;
  selectedTbomRow: TbomRecord | null;
  selectedLinkedRow: LinkedPair | null;

  // フィルタ
  cadListTypeFilter: string | null; // null = 全て
  linkedListTypeFilter: string | null;
  linkedStatusFilter: "all" | "unsaved" | "saved";
  linkedSearchText: string;
  isLinkedFilterEnabled: boolean; // 連動フィルタ ON/OFF

  // 進捗
  totalCadCount: number;
  linkedCount: number; // linkedPairs.length
  progressPercent: number;

  // 未保存変更
  hasUnsavedChanges: boolean;
}

/** 紐付け操作 */
export interface MatchingActions {
  linkPair(cadRow: CwxRecord, tbomRow: TbomRecord): LinkResult;
  addWithoutTbom(cadRow: CwxRecord): void;
  unlinkPair(pair: LinkedPair): void;
  selectCadRow(row: CwxRecord | null): void;
  selectTbomRow(row: TbomRecord | null): void;
  selectLinkedRow(pair: LinkedPair | null): void;
  setCadListTypeFilter(listType: string | null): void;
  setLinkedListTypeFilter(listType: string | null): void;
  setLinkedStatusFilter(filter: "all" | "unsaved" | "saved"): void;
  setLinkedSearchText(text: string): void;
  toggleLinkedFilter(enabled: boolean): void;
  markAsSaved(): void;
  discardChanges(): void;
}

/** 状態スナップショット（破棄用） */
interface MatchingStateSnapshot {
  unlinkedCad: CwxRecord[];
  unlinkedTbom: TbomRecord[];
  linkedPairs: LinkedPair[];
}

/** useMatchingState の初期化パラメータ */
export interface UseMatchingStateParams {
  unlinkedCad: CwxRecord[];
  unlinkedTbom: TbomRecord[];
  linkedPairs: LinkedPair[];
  totalCadCount: number;
}

/**
 * 紐付け画面の全状態を管理するカスタムフック
 */
export function useMatchingState(params?: UseMatchingStateParams) {
  // データ
  const [unlinkedCad, setUnlinkedCad] = useState<CwxRecord[]>(params?.unlinkedCad ?? []);
  const [unlinkedTbom, setUnlinkedTbom] = useState<TbomRecord[]>(params?.unlinkedTbom ?? []);
  const [linkedPairs, setLinkedPairs] = useState<LinkedPair[]>(params?.linkedPairs ?? []);
  const [totalCadCount, setTotalCadCount] = useState<number>(params?.totalCadCount ?? 0);

  // 選択
  const [selectedCadRow, setSelectedCadRow] = useState<CwxRecord | null>(null);
  const [selectedTbomRow, setSelectedTbomRow] = useState<TbomRecord | null>(null);
  const [selectedLinkedRow, setSelectedLinkedRow] = useState<LinkedPair | null>(null);

  // フィルタ
  const [cadListTypeFilter, setCadListTypeFilter] = useState<string | null>(null);
  const [linkedListTypeFilter, setLinkedListTypeFilter] = useState<string | null>(null);
  const [linkedStatusFilter, setLinkedStatusFilter] = useState<"all" | "unsaved" | "saved">("all");
  const [linkedSearchText, setLinkedSearchText] = useState<string>("");
  const [isLinkedFilterEnabled, setIsLinkedFilterEnabled] = useState<boolean>(true);

  // スナップショット（破棄用）
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<MatchingStateSnapshot>({
    unlinkedCad: params?.unlinkedCad ?? [],
    unlinkedTbom: params?.unlinkedTbom ?? [],
    linkedPairs: params?.linkedPairs ?? [],
  });

  // 初期化メソッド
  const initialize = useCallback((initParams: UseMatchingStateParams) => {
    setUnlinkedCad(initParams.unlinkedCad);
    setUnlinkedTbom(initParams.unlinkedTbom);
    setLinkedPairs(initParams.linkedPairs);
    setTotalCadCount(initParams.totalCadCount);
    setLastSavedSnapshot({
      unlinkedCad: initParams.unlinkedCad,
      unlinkedTbom: initParams.unlinkedTbom,
      linkedPairs: initParams.linkedPairs,
    });
  }, []);

  // 進捗率計算
  const linkedCount = linkedPairs.length;
  const progressPercent = useMemo(() => {
    if (totalCadCount === 0) return 0;
    return Math.round((linkedCount / totalCadCount) * 100);
  }, [linkedCount, totalCadCount]);

  // 未保存変更の有無
  const hasUnsavedChanges = useMemo(() => {
    return linkedPairs.some((pair) => pair.status === "unsaved");
  }, [linkedPairs]);

  // 紐付け操作
  const linkPair = useCallback((cadRow: CwxRecord, tbomRow: TbomRecord): LinkResult => {
    // LIST_TYPE 一致チェック
    if (cadRow.listType !== tbomRow.listType) {
      return { success: false, reason: "list_type_mismatch" };
    }

    // ペアを下段に追加
    const newPair: LinkedPair = {
      id: `link-${Date.now()}-${Math.random()}`,
      cad: cadRow,
      tbom: tbomRow,
      status: "unsaved",
    };

    setLinkedPairs((prev) => [...prev, newPair]);

    // 上段から削除
    setUnlinkedCad((prev) => prev.filter((row) => row.id !== cadRow.id));
    setUnlinkedTbom((prev) => prev.filter((row) => row.id !== tbomRow.id));

    // 選択をクリア
    setSelectedCadRow(null);
    setSelectedTbomRow(null);

    return { success: true };
  }, []);

  // T-BOM対応なしで追加
  const addWithoutTbom = useCallback((cadRow: CwxRecord) => {
    const newPair: LinkedPair = {
      id: `link-${Date.now()}-${Math.random()}`,
      cad: cadRow,
      tbom: null,
      status: "unsaved",
    };

    setLinkedPairs((prev) => [...prev, newPair]);
    setUnlinkedCad((prev) => prev.filter((row) => row.id !== cadRow.id));
    setSelectedCadRow(null);
  }, []);

  // 紐付け解除
  const unlinkPair = useCallback((pair: LinkedPair) => {
    setLinkedPairs((prev) => prev.filter((p) => p.id !== pair.id));

    // CADを上段左に復元
    setUnlinkedCad((prev) => [...prev, pair.cad]);

    // T-BOMが存在する場合は上段右に復元
    if (pair.tbom) {
      const tbomRecord = pair.tbom; // 型絞り込みのため変数に代入
      setUnlinkedTbom((prev) => [...prev, tbomRecord]);
    }

    setSelectedLinkedRow(null);
  }, []);

  // CAD行選択
  const selectCadRow = useCallback(
    (row: CwxRecord | null) => {
      setSelectedCadRow(row);

      // 連動フィルタが有効な場合、T-BOMを同一LIST_TYPEでフィルタ
      if (isLinkedFilterEnabled && row) {
        setCadListTypeFilter(row.listType);
      } else if (!isLinkedFilterEnabled) {
        setCadListTypeFilter(null);
      }
    },
    [isLinkedFilterEnabled],
  );

  // T-BOM行選択
  const selectTbomRow = useCallback((row: TbomRecord | null) => {
    setSelectedTbomRow(row);
  }, []);

  // 下段行選択
  const selectLinkedRow = useCallback((pair: LinkedPair | null) => {
    setSelectedLinkedRow(pair);
  }, []);

  // 連動フィルタ切り替え
  const toggleLinkedFilter = useCallback((enabled: boolean) => {
    setIsLinkedFilterEnabled(enabled);
    if (!enabled) {
      setCadListTypeFilter(null);
    }
  }, []);

  // 保存完了（バッジ更新、スナップショット作成）
  const markAsSaved = useCallback(() => {
    setLinkedPairs((prev) => prev.map((pair) => ({ ...pair, status: "saved" as const })));

    // スナップショット更新
    setLastSavedSnapshot({
      unlinkedCad,
      unlinkedTbom,
      linkedPairs: linkedPairs.map((pair) => ({
        ...pair,
        status: "saved" as const,
      })),
    });
  }, [unlinkedCad, unlinkedTbom, linkedPairs]);

  // 破棄（前回保存時点に復元）
  const discardChanges = useCallback(() => {
    setUnlinkedCad(lastSavedSnapshot.unlinkedCad);
    setUnlinkedTbom(lastSavedSnapshot.unlinkedTbom);
    setLinkedPairs(lastSavedSnapshot.linkedPairs);
    setSelectedCadRow(null);
    setSelectedTbomRow(null);
    setSelectedLinkedRow(null);
  }, [lastSavedSnapshot]);

  const state: MatchingState = {
    unlinkedCad,
    unlinkedTbom,
    linkedPairs,
    selectedCadRow,
    selectedTbomRow,
    selectedLinkedRow,
    cadListTypeFilter,
    linkedListTypeFilter,
    linkedStatusFilter,
    linkedSearchText,
    isLinkedFilterEnabled,
    totalCadCount,
    linkedCount,
    progressPercent,
    hasUnsavedChanges,
  };

  const actions: MatchingActions & { initialize: typeof initialize } = {
    linkPair,
    addWithoutTbom,
    unlinkPair,
    selectCadRow,
    selectTbomRow,
    selectLinkedRow,
    setCadListTypeFilter,
    setLinkedListTypeFilter,
    setLinkedStatusFilter,
    setLinkedSearchText,
    toggleLinkedFilter,
    markAsSaved,
    discardChanges,
    initialize,
  };

  // 両方の形式をサポート（後方互換性とフラットアクセス）
  return {
    ...state,
    ...actions,
    state,
    actions,
  };
}
