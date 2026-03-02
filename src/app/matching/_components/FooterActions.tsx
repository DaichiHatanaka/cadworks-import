"use client";

import { cn } from "@/lib/utils";

interface FooterActionsProps {
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onExit: () => void;
  onExport: () => void;
}

export function FooterActions({
  hasUnsavedChanges,
  onSave,
  onDiscard,
  onExit,
  onExport,
}: FooterActionsProps) {
  const handleDiscard = () => {
    const confirmed = window.confirm("未保存の変更をすべて破棄しますか?この操作は取り消せません。");
    if (confirmed) {
      onDiscard();
    }
  };

  const handleExit = () => {
    const message = hasUnsavedChanges
      ? "未保存のデータがあります。保存せずに終了しますか?"
      : "紐付け作業を終了します。よろしいですか?";

    const confirmed = window.confirm(message);
    if (confirmed) {
      onExit();
    }
  };

  return (
    <footer className="flex items-center justify-between border-t bg-white px-6 py-4">
      {/* 低リスク操作: 左端 */}
      <div>
        <button
          onClick={onExport}
          className={cn(
            "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700",
            "hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none",
          )}
        >
          Excel出力
        </button>
      </div>

      {/* 高リスク操作: 右寄り */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleDiscard}
          className={cn(
            "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700",
            "hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none",
          )}
        >
          破棄
        </button>

        <button
          onClick={onSave}
          className={cn(
            "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white",
            "hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none",
          )}
        >
          保存
        </button>

        <button
          onClick={handleExit}
          className={cn(
            "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700",
            "hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none",
          )}
        >
          紐付け終了
        </button>
      </div>
    </footer>
  );
}
