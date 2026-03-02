"use client";

import type { CwxRecord, TbomRecord, LinkedPair } from "@/lib/matching/types";
import type { LinkResult } from "@/lib/matching/use-matching-state";

interface LinkActionsProps {
  selectedCadRow: CwxRecord | null;
  selectedTbomRow: TbomRecord | null;
  selectedLinkedRow: LinkedPair | null;
  onLink: (cadRow: CwxRecord, tbomRow: TbomRecord) => LinkResult;
  onAdd: (cadRow: CwxRecord) => void;
  onUnlink: (pair: LinkedPair) => void;
}

/**
 * 紐付け・追加・解除ボタン群
 * 行選択状態に基づいてボタンの有効/無効を制御し、操作を実行する
 */
export function LinkActions({
  selectedCadRow,
  selectedTbomRow,
  selectedLinkedRow,
  onLink,
  onAdd,
  onUnlink,
}: LinkActionsProps) {
  // ボタン有効/無効状態
  const canLink = selectedCadRow !== null && selectedTbomRow !== null;
  const canAdd = selectedCadRow !== null;
  const canUnlink = selectedLinkedRow !== null;

  // 紐付け処理
  const handleLink = () => {
    if (!selectedCadRow || !selectedTbomRow) return;

    const result = onLink(selectedCadRow, selectedTbomRow);

    // LIST_TYPE不一致の場合は警告ダイアログ表示
    if (!result.success && result.reason === "list_type_mismatch") {
      alert("リストタイプが一致しません。同一リストタイプの機器のみ紐付けできます。");
    }
  };

  // 追加処理
  const handleAdd = () => {
    if (!selectedCadRow) return;
    onAdd(selectedCadRow);
  };

  // 解除処理
  const handleUnlink = () => {
    if (!selectedLinkedRow) return;
    onUnlink(selectedLinkedRow);
  };

  return (
    <div className="flex gap-3 border-t border-gray-200 bg-gray-50 p-4">
      {/* 紐付けボタン */}
      <button
        onClick={handleLink}
        disabled={!canLink}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
      >
        紐付け
      </button>

      {/* 追加ボタン */}
      <button
        onClick={handleAdd}
        disabled={!canAdd}
        className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
      >
        追加
      </button>

      {/* 紐付け解除ボタン */}
      <button
        onClick={handleUnlink}
        disabled={!canUnlink}
        className="ml-auto rounded bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
      >
        紐付け解除
      </button>
    </div>
  );
}
