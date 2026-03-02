"use client";

import { useState } from "react";

/**
 * 操作ガイド・凡例パネル
 * マッチング画面の操作手順と色の意味を表示する折りたたみパネル
 */
export function MatchingLegend() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-gray-200 bg-gray-50 px-4">
      {/* トグルバー */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center gap-2 py-2 text-left text-xs text-gray-600 hover:text-gray-900"
      >
        <span className="font-medium">操作ガイド・凡例</span>
        <span className="ml-auto text-gray-400">{isOpen ? "▲ 閉じる" : "▼ 開く"}</span>
      </button>

      {/* 折りたたみコンテンツ */}
      {isOpen && (
        <div className="flex gap-8 pb-3">
          {/* 操作手順 */}
          <div>
            <p className="mb-1.5 text-xs font-semibold text-gray-700">操作手順</p>
            <ol className="flex flex-wrap gap-3 text-xs text-gray-600">
              <li className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1976D2] text-[10px] font-bold text-white">
                  1
                </span>
                上段左のCAD行を選択
              </li>
              <li className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1976D2] text-[10px] font-bold text-white">
                  2
                </span>
                上段右のT-BOM行を選択
              </li>
              <li className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1976D2] text-[10px] font-bold text-white">
                  3
                </span>
                「紐付け」ボタンを押す
              </li>
              <li className="flex items-center gap-1.5 text-gray-400">
                <span>または</span>
                CAD行をT-BOM行へドラッグ&ドロップ
              </li>
            </ol>
          </div>

          {/* 色の凡例 */}
          <div>
            <p className="mb-1.5 text-xs font-semibold text-gray-700">色の凡例（下段テーブル）</p>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <span className="h-4 w-8 rounded border border-blue-200 bg-blue-100" />
                選択中
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-4 w-8 rounded bg-[#FFA500]" />
                値の差異あり
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-4 w-8 rounded bg-[#E0E0E0]" />
                T-BOMなし
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-full bg-[#FFC107] px-2 py-0.5 text-[10px] font-medium text-gray-900">
                  未保存
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-full bg-[#4CAF50] px-2 py-0.5 text-[10px] font-medium text-white">
                  保存済み
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
