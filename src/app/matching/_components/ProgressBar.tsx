"use client";

interface ProgressBarProps {
  totalCadCount: number;
  linkedCount: number;
  progressPercent: number;
}

/**
 * 紐付け進捗バーコンポーネント
 * 進捗率に応じて色分けされた水平プログレスバーを表示する
 */
export function ProgressBar({ totalCadCount, linkedCount, progressPercent }: ProgressBarProps) {
  // 進捗率に応じた色分け
  const getProgressColor = (percent: number): string => {
    if (percent >= 90) return "bg-[#4CAF50]"; // 緑
    if (percent >= 50) return "bg-[#FFC107]"; // 黄
    return "bg-[#F44336]"; // 赤
  };

  const progressColor = getProgressColor(progressPercent);

  return (
    <div className="flex flex-col gap-2">
      {/* プログレステキスト */}
      <div className="text-sm font-medium text-gray-700">
        紐付け進捗 {progressPercent}% ({linkedCount}/{totalCadCount})
      </div>

      {/* プログレスバー */}
      <div
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-3 w-full overflow-hidden rounded-full bg-gray-200"
      >
        <div
          data-testid="progress-fill"
          className={`h-full transition-all duration-300 ${progressColor}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
