"use client";

interface SelectionProgressDialogProps {
  open: boolean;
  onClose: () => void;
  running: boolean;
  summary: {
    total: number;
    selected: number;
    unestimated: number;
    multipleCandidates: number;
  } | null;
}

export default function SelectionProgressDialog({
  open,
  onClose,
  running,
  summary,
}: SelectionProgressDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-80 rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">機器選定</h3>

        {running ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-xs text-gray-500">選定処理を実行中...</p>
          </div>
        ) : summary ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">対象件数</span>
                  <span className="ml-2 font-semibold">{summary.total}</span>
                </div>
                <div>
                  <span className="text-green-600">選定済</span>
                  <span className="ml-2 font-semibold text-green-700">{summary.selected}</span>
                </div>
                <div>
                  <span className="text-red-600">未積算</span>
                  <span className="ml-2 font-semibold text-red-700">{summary.unestimated}</span>
                </div>
                <div>
                  <span className="text-yellow-600">複数候補</span>
                  <span className="ml-2 font-semibold text-yellow-700">
                    {summary.multipleCandidates}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              閉じる
            </button>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-red-500">
            選定処理でエラーが発生しました
            <button
              onClick={onClose}
              className="mt-3 block w-full rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
