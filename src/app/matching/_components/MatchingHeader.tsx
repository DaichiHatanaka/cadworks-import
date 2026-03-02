"use client";

import { ProgressBar } from "./ProgressBar";

interface MatchingHeaderProps {
  screenTitle: string;
  jobNo: string;
  caseNo: string;
  constructionType: string;
  totalCadCount: number;
  linkedCount: number;
  progressPercent: number;
}

/**
 * 紐付け画面のヘッダーコンポーネント
 * 画面タイトル、工番情報、プログレスバーを表示する
 */
export function MatchingHeader({
  screenTitle,
  jobNo,
  caseNo,
  constructionType,
  totalCadCount,
  linkedCount,
  progressPercent,
}: MatchingHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
      <div className="mx-auto max-w-7xl">
        {/* タイトルと工番情報 */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{screenTitle}</h1>
          <div className="flex gap-6 text-sm text-gray-600">
            <div>
              <span className="font-medium">工番:</span>{" "}
              <span className="text-gray-900">{jobNo}</span>
            </div>
            <div>
              <span className="font-medium">ケース:</span>{" "}
              <span className="text-gray-900">{caseNo}</span>
            </div>
            <div>
              <span className="font-medium">施工区分:</span>{" "}
              <span className="text-gray-900">{constructionType}</span>
            </div>
          </div>
        </div>

        {/* プログレスバー */}
        <ProgressBar
          totalCadCount={totalCadCount}
          linkedCount={linkedCount}
          progressPercent={progressPercent}
        />
      </div>
    </header>
  );
}
