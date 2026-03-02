"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useNbomState } from "@/lib/nbom/use-nbom-state";
import { useViewState } from "@/lib/nbom/use-view-state";
import { useGridState } from "@/lib/nbom/use-grid-state";
import { useSummary } from "@/lib/nbom/use-summary";
import { useDetailPanel } from "@/lib/nbom/use-detail-panel";
import { groupByFolder, groupByListType, groupByTag, groupByStatus } from "@/lib/nbom/grouping";
import GlobalHeader from "./GlobalHeader";
import JobNavigator from "./JobNavigator";
import ViewControlBar from "./ViewControlBar";
import ContextActionBar from "./ContextActionBar";
import DataGrid from "./DataGrid";
import SummaryBar from "./SummaryBar";
import DetailPanel from "./DetailPanel";
import SelectionProgressDialog from "./SelectionProgressDialog";

export default function NbomWorkspace({ jobNo }: { jobNo: string }) {
  const nbom = useNbomState(jobNo);
  const view = useViewState();
  const grid = useGridState();
  const summary = useSummary(nbom.items, grid.selectedIds);
  const detail = useDetailPanel(nbom.items, grid.selectedIds);

  // フィルタ適用後のアイテム
  const filteredItems = useMemo(() => view.filterItems(nbom.items), [view, nbom.items]);

  // ビュー軸に応じたグルーピング
  const groupedNodes = useMemo(() => {
    switch (view.activeView) {
      case "folder":
        return groupByFolder(filteredItems, nbom.folders);
      case "equipment":
        return groupByListType(filteredItems, nbom.listTypeMaster);
      case "area":
        return groupByTag(filteredItems, "area");
      case "trade":
        return groupByTag(filteredItems, "equipment_type");
      case "status":
        return groupByStatus(filteredItems);
    }
  }, [view.activeView, filteredItems, nbom.folders, nbom.listTypeMaster]);

  // フラット行リスト
  const flatRows = useMemo(() => grid.flattenGroups(groupedNodes), [grid, groupedNodes]);

  // 選定ダイアログ state
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const [selectionSummary, setSelectionSummary] = useState<{
    total: number;
    selected: number;
    unestimated: number;
    multipleCandidates: number;
  } | null>(null);

  const handleRunSelection = useCallback(
    async (costItemIds?: string[]) => {
      setSelectionDialogOpen(true);
      setSelectionSummary(null);
      const result = await nbom.runSelection(costItemIds);
      setSelectionSummary(result);
    },
    [nbom],
  );

  if (nbom.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-3 text-sm text-gray-500">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (nbom.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-red-600">エラーが発生しました</h2>
          <p className="mt-2 text-sm text-gray-600">{nbom.error}</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={nbom.refresh}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              再試行
            </button>
            <Link
              href="/"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <GlobalHeader jobNo={jobNo} />

      <div className="flex min-h-0 flex-1">
        {/* 左サイドバー: JOBナビゲーター */}
        <JobNavigator currentJobNo={jobNo} />

        {/* メインエリア */}
        <div className="flex min-w-0 flex-1 flex-col">
          <ViewControlBar
            activeView={view.activeView}
            onViewChange={view.setActiveView}
            filters={view.filters}
            onAddFilter={view.addFilter}
            onRemoveFilter={view.removeFilter}
            onClearFilters={view.clearFilters}
            searchText={view.searchText}
            onSearchChange={view.setSearchText}
            columnVisibility={view.columnVisibility}
            onToggleColumn={view.toggleColumn}
            items={nbom.items}
            getFilterOptions={view.getFilterOptions}
          />

          <ContextActionBar
            selectedIds={grid.selectedIds}
            items={nbom.items}
            onDelete={nbom.deleteItem}
            onBulkUpdate={nbom.bulkUpdate}
            onAddItem={() => nbom.addItem({ name: "新規原価項目" })}
            onRunSelection={handleRunSelection}
            selectionRunning={nbom.selectionRunning}
          />

          <DataGrid
            rows={flatRows}
            selectedIds={grid.selectedIds}
            onToggleSelection={grid.toggleSelection}
            onSelectRange={grid.selectRange}
            onToggleGroup={grid.toggleGroup}
            editingCell={grid.editingCell}
            onStartEdit={grid.startEdit}
            onCancelEdit={grid.cancelEdit}
            onUpdateItem={nbom.updateItem}
            columnVisibility={view.columnVisibility}
          />

          <SummaryBar summary={summary} />
        </div>

        {/* 右サイドパネル: ディテール */}
        {detail.isOpen && detail.selectedItem && (
          <DetailPanel
            item={detail.selectedItem}
            activeTab={detail.activeTab}
            onTabChange={detail.setActiveTab}
            onClose={detail.close}
            onUpdateItem={nbom.updateItem}
            onAssignTag={nbom.assignTag}
            onRemoveTag={nbom.removeTag}
            onOverrideSelection={nbom.overrideSelection}
            jobNo={jobNo}
          />
        )}
      </div>

      <SelectionProgressDialog
        open={selectionDialogOpen}
        onClose={() => setSelectionDialogOpen(false)}
        running={nbom.selectionRunning}
        summary={selectionSummary}
      />
    </div>
  );
}
