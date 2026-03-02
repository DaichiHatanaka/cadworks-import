"use client";

import { useState, useCallback, useEffect } from "react";
import type { CostItem, Folder, TagDefinition } from "./types";

export function useNbomState(jobNo: string) {
  const [items, setItems] = useState<CostItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tagDefinitions, setTagDefinitions] = useState<TagDefinition[]>([]);
  const [listTypeMaster, setListTypeMaster] = useState<{ listType: string; listName: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionRunning, setSelectionRunning] = useState(false);

  /** 初期化: init → データ取得 */
  const initialize = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: init API で link_results → cost_items を生成
      const initRes = await fetch(`/api/nbom/init?jobNo=${encodeURIComponent(jobNo)}`);
      if (!initRes.ok) {
        const data = await initRes.json();
        throw new Error(data.error ?? "初期化に失敗しました");
      }

      // Step 2: 各データを並行取得
      const [itemsRes, foldersRes, tagsRes, masterRes] = await Promise.all([
        fetch(`/api/nbom/cost-items?jobNo=${encodeURIComponent(jobNo)}`),
        fetch(`/api/nbom/folders?jobNo=${encodeURIComponent(jobNo)}`),
        fetch(`/api/nbom/tags?jobNo=${encodeURIComponent(jobNo)}`),
        fetch("/api/matching/list-types"),
      ]);

      if (!itemsRes.ok) throw new Error("原価項目の取得に失敗しました");
      if (!foldersRes.ok) throw new Error("フォルダの取得に失敗しました");

      const itemsData = await itemsRes.json();
      const foldersData = await foldersRes.json();
      const tagsData = tagsRes.ok ? await tagsRes.json() : [];
      const masterData = masterRes.ok ? await masterRes.json() : [];

      setItems(itemsData);
      setFolders(foldersData);
      setTagDefinitions(tagsData);
      setListTypeMaster(masterData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [jobNo]);

  useEffect(() => {
    if (jobNo) initialize();
  }, [jobNo, initialize]);

  /** 原価項目を更新（楽観的更新） */
  const updateItem = useCallback(
    async (id: string, updates: Partial<CostItem>) => {
      // 楽観的更新
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));

      try {
        const res = await fetch(`/api/nbom/cost-items/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error("更新に失敗しました");
        const updated = await res.json();
        // サーバーの結果で上書き
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...updated, tags: item.tags } : item)),
        );
      } catch {
        // ロールバック
        initialize();
      }
    },
    [initialize],
  );

  /** 原価項目を新規追加 */
  const addItem = useCallback(
    async (data: { name: string; listType?: string; folderId?: string }) => {
      try {
        const res = await fetch("/api/nbom/cost-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, jobNo }),
        });
        if (!res.ok) throw new Error("追加に失敗しました");
        const created = await res.json();
        setItems((prev) => [...prev, created]);
        return created;
      } catch {
        return null;
      }
    },
    [jobNo],
  );

  /** 原価項目を削除 */
  const deleteItem = useCallback(
    async (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      try {
        const res = await fetch(`/api/nbom/cost-items/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("削除に失敗しました");
      } catch {
        initialize();
      }
    },
    [initialize],
  );

  /** 一括更新 */
  const bulkUpdate = useCallback(
    async (ids: string[], updates: Record<string, unknown>) => {
      // 楽観的更新
      setItems((prev) =>
        prev.map((item) => (ids.includes(item.id) ? { ...item, ...updates } : item)),
      );

      try {
        const res = await fetch("/api/nbom/cost-items/bulk", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids, updates }),
        });
        if (!res.ok) throw new Error("一括更新に失敗しました");
      } catch {
        initialize();
      }
    },
    [initialize],
  );

  /** タグ付与 */
  const assignTag = useCallback(
    async (costItemIds: string[], category: string, value: string) => {
      try {
        const res = await fetch("/api/nbom/tags/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ costItemIds, category, value, jobNo }),
        });
        if (!res.ok) throw new Error("タグ付与に失敗しました");
        // リフレッシュ
        const itemsRes = await fetch(`/api/nbom/cost-items?jobNo=${encodeURIComponent(jobNo)}`);
        if (itemsRes.ok) setItems(await itemsRes.json());
      } catch {
        // silent
      }
    },
    [jobNo],
  );

  /** タグ削除 */
  const removeTag = useCallback(
    async (costItemIds: string[], category: string, value: string) => {
      try {
        const res = await fetch("/api/nbom/tags/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ costItemIds, category, value }),
        });
        if (!res.ok) throw new Error("タグ削除に失敗しました");
        // リフレッシュ
        const itemsRes = await fetch(`/api/nbom/cost-items?jobNo=${encodeURIComponent(jobNo)}`);
        if (itemsRes.ok) setItems(await itemsRes.json());
      } catch {
        // silent
      }
    },
    [jobNo],
  );

  /** フォルダ作成 */
  const addFolder = useCallback(
    async (name: string, parentId?: string) => {
      try {
        const res = await fetch("/api/nbom/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobNo, name, parentId }),
        });
        if (!res.ok) throw new Error("フォルダ作成に失敗しました");
        const created = await res.json();
        setFolders((prev) => [...prev, created]);
        return created;
      } catch {
        return null;
      }
    },
    [jobNo],
  );

  /** 機器選定実行 */
  const runSelection = useCallback(
    async (costItemIds?: string[]) => {
      setSelectionRunning(true);
      try {
        const res = await fetch("/api/selection/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobNo, costItemIds }),
        });
        if (!res.ok) throw new Error("機器選定に失敗しました");
        const data = await res.json();

        // データをリフレッシュ
        const itemsRes = await fetch(`/api/nbom/cost-items?jobNo=${encodeURIComponent(jobNo)}`);
        if (itemsRes.ok) setItems(await itemsRes.json());

        return data.summary as {
          total: number;
          selected: number;
          unestimated: number;
          multipleCandidates: number;
        };
      } catch {
        return null;
      } finally {
        setSelectionRunning(false);
      }
    },
    [jobNo],
  );

  /** 手動選定 */
  const overrideSelection = useCallback(
    async (costItemId: string, productId: string) => {
      try {
        const res = await fetch("/api/selection/override", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ costItemId, productId }),
        });
        if (!res.ok) throw new Error("手動選定に失敗しました");

        // データをリフレッシュ
        const itemsRes = await fetch(`/api/nbom/cost-items?jobNo=${encodeURIComponent(jobNo)}`);
        if (itemsRes.ok) setItems(await itemsRes.json());
      } catch {
        // silent
      }
    },
    [jobNo],
  );

  return {
    items,
    folders,
    tagDefinitions,
    listTypeMaster,
    loading,
    error,
    selectionRunning,
    updateItem,
    addItem,
    deleteItem,
    bulkUpdate,
    assignTag,
    removeTag,
    addFolder,
    runSelection,
    overrideSelection,
    refresh: initialize,
  };
}
