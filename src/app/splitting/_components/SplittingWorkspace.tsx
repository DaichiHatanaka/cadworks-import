"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { parseKikiNo } from "@/lib/splitting/split-logic";
import { SplittingTable } from "./SplittingTable";
import { saveWorkspaceParams } from "@/lib/workspace-params";
import type { SplitCandidate, SplitCandidatesResponse } from "@/lib/splitting/types";

interface SplittingWorkspaceProps {
  jobNo: string;
}

export function SplittingWorkspace({ jobNo }: SplittingWorkspaceProps) {
  const router = useRouter();

  useEffect(() => {
    saveWorkspaceParams({ jobNo });
  }, [jobNo]);

  const [candidates, setCandidates] = useState<SplitCandidate[]>([]);
  const [stats, setStats] = useState({ total: 0, autoCount: 0, manualCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/splitting/candidates?jobNo=${encodeURIComponent(jobNo)}`);
      if (!res.ok) throw new Error("データの取得に失敗しました");
      const data: SplitCandidatesResponse = await res.json();
      setCandidates(data.candidates);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [jobNo]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleSplit = async (id: string, kikiNos: string[]) => {
    const res = await fetch("/api/splitting/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobNo, items: [{ id, kikiNos }] }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "分割処理に失敗しました");
    }
  };

  const handleBulkSplit = async () => {
    const autoItems = candidates
      .filter((c) => c.canAutoSplit && c.parsedKikiNos)
      .map((c) => ({ id: c.id, kikiNos: c.parsedKikiNos! }));

    if (autoItems.length === 0) return;

    setIsBulkLoading(true);
    try {
      const res = await fetch("/api/splitting/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobNo, items: autoItems }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "一括分割に失敗しました");
      }
      // 一括分割後はデータを再取得して画面更新
      await fetchCandidates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsBulkLoading(false);
    }
  };

  // 手動対応行の「分割」後に再取得するラッパー
  const handleSingleSplit = async (id: string, kikiNos: string[]) => {
    await handleSplit(id, kikiNos);
    // 分割後のリストを再取得して候補から除外する
    const res = await fetch(`/api/splitting/candidates?jobNo=${encodeURIComponent(jobNo)}`);
    if (res.ok) {
      const data: SplitCandidatesResponse = await res.json();
      setCandidates(data.candidates);
      setStats(data.stats);
    }
  };

  const remainingCount = candidates.filter((c) => {
    const parsed = parseKikiNo(c.kikiNo);
    return parsed && parsed.length > 1;
  }).length;

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-sm text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={fetchCandidates}
          className="mt-3 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">機器分割</h1>
          <p className="mt-0.5 text-sm text-gray-500">工番: {jobNo}</p>
        </div>
        <button
          onClick={() => router.push(`/?jobNo=${encodeURIComponent(jobNo)}`)}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          ← ホームに戻る
        </button>
      </div>

      {/* サマリーバー */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">分割対象合計</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">{stats.autoCount}</div>
            <div className="text-xs text-gray-500">自動分割可</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-700">{stats.manualCount}</div>
            <div className="text-xs text-gray-500">手動対応必要</div>
          </div>
          <div className="ml-auto">
            <button
              onClick={handleBulkSplit}
              disabled={stats.autoCount === 0 || isBulkLoading}
              className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBulkLoading ? "処理中..." : `自動分割を一括実行 (${stats.autoCount}件)`}
            </button>
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        <strong>注意:</strong> 分割前に「金額」と「機器数量」のバックアップを取得してください。
        設計担当者が手動で原価を調整していた場合、分割後に金額が変わる可能性があります。
      </div>

      {/* 分割テーブル */}
      {candidates.length > 0 ? (
        <SplittingTable candidates={candidates} onSplit={handleSingleSplit} />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-500">分割対象の機器がありません。</p>
          <p className="mt-1 text-xs text-gray-400">
            対象リストタイプ（L121〜L841）かつ数量2以上のT-BOM機器が対象です。
          </p>
        </div>
      )}

      {/* フッター */}
      <div className="flex justify-end border-t border-gray-200 pt-4">
        <button
          onClick={() =>
            router.push(
              `/matching?jobNo=${encodeURIComponent(jobNo)}&caseNo=A&constructionType=新築&listTypes=標準`,
            )
          }
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          マスター作成へ進む →
        </button>
      </div>
    </div>
  );
}
