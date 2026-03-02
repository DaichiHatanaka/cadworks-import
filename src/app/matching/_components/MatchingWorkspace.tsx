"use client";

import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import { MatchingHeader } from "./MatchingHeader";
import { CadUnlinkedTable } from "./CadUnlinkedTable";
import { TbomUnlinkedTable } from "./TbomUnlinkedTable";
import { LinkActions } from "./LinkActions";
import { LinkedMirrorTable } from "./LinkedMirrorTable";
import { FooterActions } from "./FooterActions";
import { MatchingLegend } from "./MatchingLegend";
import { useMatchingState } from "@/lib/matching/use-matching-state";

import { useMediaQuery } from "@/lib/matching/use-media-query";
import type { CwxRecord, TbomRecord } from "@/lib/matching/types";

interface MatchingWorkspaceProps {
  jobNo: string;
  caseNo: string;
  constructionType: string;
  listTypes: string;
}

export function MatchingWorkspace({
  jobNo,
  caseNo,
  constructionType,
  listTypes,
}: MatchingWorkspaceProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [screenTitle, setScreenTitle] = useState("CADWorx データ紐付け");

  // レスポンシブ対応
  const isDesktop = useMediaQuery("(min-width: 1440px)");
  const isTablet = useMediaQuery("(min-width: 1024px) and (max-width: 1439px)");
  const isMobile = useMediaQuery("(max-width: 1023px)");

  const matchingState = useMatchingState();
  // 利用可能なリストタイプを計算
  const availableListTypes = Array.from(
    new Set(matchingState.unlinkedCad.map((row) => row.listType)),
  ).sort();

  // 初期データ取得
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/matching/init?jobNo=${encodeURIComponent(jobNo)}&caseNo=${encodeURIComponent(caseNo)}&constructionType=${encodeURIComponent(constructionType)}&listTypes=${encodeURIComponent(listTypes)}`,
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404 ? "データが見つかりませんでした" : "データ取得に失敗しました",
          );
        }

        const data = await response.json();

        // 状態を初期化
        matchingState.initialize({
          unlinkedCad: data.unlinkedCad,
          unlinkedTbom: data.unlinkedTbom,
          linkedPairs: data.linkedPairs,
          totalCadCount: data.stats.totalCadCount,
        });

        setScreenTitle(data.header.screenTitle);
      } catch (err) {
        setError(err instanceof Error ? err.message : "データ取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [jobNo, caseNo, constructionType, listTypes]);

  // ドラッグ&ドロップ処理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const cadRow = active.data.current as CwxRecord | undefined;
    const tbomRow = over.data.current as TbomRecord | undefined;

    if (cadRow && tbomRow) {
      const result = matchingState.linkPair(cadRow, tbomRow);
      if (!result.success && result.reason === "list_type_mismatch") {
        alert("リストタイプが一致しません。同一リストタイプの機器のみ紐付けできます。");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <div className="text-lg text-red-600">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          再試行
        </button>
      </div>
    );
  }

  // 1024px 未満の場合は警告を表示
  if (isMobile) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-4">
        <div className="rounded-lg border border-orange-400 bg-orange-50 p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-orange-800">画面幅が不足しています</h2>
          <p className="text-orange-700">この画面は最低 1024px の画面幅が必要です。</p>
          <p className="mt-2 text-sm text-orange-600">現在の画面幅: {window.innerWidth}px</p>
          <p className="mt-2 text-sm text-orange-600">
            デスクトップまたはタブレット端末でアクセスしてください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen flex-col">
        {/* ヘッダー */}
        <MatchingHeader
          screenTitle={screenTitle}
          jobNo={jobNo}
          caseNo={caseNo}
          constructionType={constructionType}
          totalCadCount={matchingState.totalCadCount}
          linkedCount={matchingState.linkedCount}
          progressPercent={matchingState.progressPercent}
        />

        {/* 操作ガイド・凡例 */}
        <MatchingLegend />

        {/* メインコンテンツエリア */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="flex h-full flex-col gap-4">
            {/* 上段: 未紐付けテーブル（2ペイン） */}
            <div className="grid h-1/2 grid-cols-2 gap-4">
              {/* 上段左: CAD 未紐付け */}
              <div className="flex flex-col overflow-hidden rounded-lg border bg-white shadow">
                <CadUnlinkedTable
                  data={matchingState.unlinkedCad}
                  selectedRow={matchingState.selectedCadRow}
                  onSelectRow={matchingState.selectCadRow}
                  onDoubleClick={(row) => matchingState.addWithoutTbom(row)}
                  listTypeFilter={matchingState.cadListTypeFilter}
                  availableListTypes={availableListTypes}
                  onListTypeFilterChange={matchingState.setCadListTypeFilter}
                />
              </div>

              {/* 上段右: T-BOM 未紐付け */}
              <div className="flex flex-col overflow-hidden rounded-lg border bg-white shadow">
                <TbomUnlinkedTable
                  data={matchingState.unlinkedTbom}
                  selectedRow={matchingState.selectedTbomRow}
                  onSelectRow={matchingState.selectTbomRow}
                  listTypeFilter={
                    matchingState.isLinkedFilterEnabled
                      ? (matchingState.selectedCadRow?.listType ?? null)
                      : null
                  }
                  availableListTypes={availableListTypes}
                  onListTypeFilterChange={() => {}}
                  isLinkedFilterEnabled={matchingState.isLinkedFilterEnabled}
                />
              </div>
            </div>

            {/* 手動紐付け操作ボタン */}
            <div className="flex justify-center gap-2">
              <LinkActions
                selectedCadRow={matchingState.selectedCadRow}
                selectedTbomRow={matchingState.selectedTbomRow}
                selectedLinkedRow={matchingState.selectedLinkedRow}
                onLink={(cadRow, tbomRow) => {
                  const result = matchingState.linkPair(cadRow, tbomRow);
                  if (!result.success && result.reason === "list_type_mismatch") {
                    alert("リストタイプが一致しません。同一リストタイプの機器のみ紐付けできます。");
                  }
                  return result;
                }}
                onAdd={(cadRow) => {
                  matchingState.addWithoutTbom(cadRow);
                }}
                onUnlink={(pair) => {
                  matchingState.unlinkPair(pair);
                }}
              />
            </div>

            {/* 下段: 紐付け済みミラーテーブル */}
            <div className="flex h-1/2 flex-col overflow-hidden rounded-lg border bg-white shadow">
              <LinkedMirrorTable
                pairs={matchingState.linkedPairs}
                selectedRow={matchingState.selectedLinkedRow}
                onSelectRow={matchingState.selectLinkedRow}
                listTypeFilter={matchingState.linkedListTypeFilter}
                statusFilter={matchingState.linkedStatusFilter}
                searchText={matchingState.linkedSearchText}
              />
            </div>
          </div>
        </div>

        {/* フッターアクションバー */}
        <FooterActions
          hasUnsavedChanges={matchingState.hasUnsavedChanges}
          onSave={async () => {
            // 保存処理
            const unsavedPairs = matchingState.linkedPairs.filter((p) => p.status === "unsaved");
            const response = await fetch("/api/matching/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jobNo,
                pairs: unsavedPairs.map((p) => ({
                  cadId: p.cad.id,
                  tbomId: p.tbom?.id ?? null,
                  status: "unsaved" as const,
                })),
              }),
            });

            if (response.ok) {
              matchingState.markAsSaved();
              alert(`${unsavedPairs.length}件の紐付けを保存しました。`);
            } else {
              alert("保存に失敗しました。再度お試しください。");
            }
          }}
          onDiscard={() => {
            if (confirm("未保存の変更をすべて破棄しますか？この操作は取り消せません。")) {
              matchingState.discardChanges();
            }
          }}
          onExit={async () => {
            const message = matchingState.hasUnsavedChanges
              ? "未保存のデータがあります。保存せずに終了しますか？"
              : "紐付け作業を終了します。よろしいですか？";

            if (confirm(message)) {
              window.location.href = "/"; // TBOM-101（メイン画面）へ遷移
            }
          }}
          onExport={async () => {
            const response = await fetch(`/api/matching/export?jobNo=${encodeURIComponent(jobNo)}`);
            if (response.ok) {
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `matching-result-${jobNo}.xlsx`;
              a.click();
              URL.revokeObjectURL(url);
            } else {
              alert("Excel 出力に失敗しました。");
            }
          }}
        />
      </div>

      {/* ドラッグオーバーレイ */}
      <DragOverlay>
        {matchingState.selectedCadRow && (
          <div className="rounded bg-white p-2 shadow-lg">
            {matchingState.selectedCadRow.kikiNo}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
